// Imports
const axios = require('axios');
const tough = require('tough-cookie');
const { CookieJar } = tough;

const cookieJar = new CookieJar();
const baseURL = 'http://localhost:3000';

axios.defaults.jar = cookieJar;

// OpenAI API
const { openai, getCurrentDateAndHour } = require('../functions/imports');

// Main function that classifies the user's response in one of the options that can be made with Outlook's API.
async function outlookClassification(input) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. Given this sentence "${input}". According to the main action of the sentence (if necessary, only focus in the main action, imagine where the action will take place considering the best platform to have it), determine which of the following options it belongs to: 

    1.- Get all scheduled events starting today.
    2.- Get all scheduled events starting today, but up to the following 7 days. 
    3.- Get all scheduled events starting today, but up to the following 31 days.
    4.- Schedule a meeting.
    
    Remember, there are only these 4 options, there are no others available. Just answer with the number of the option, without the period.
    Answer format: "[number]"
    Example: "2"
        
    In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });
    
  return outlookDecisionClassification(parseInt(response.data.choices[0].text), input); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
}

// Function that decides which other functions to call depending on the choice that was made in the previous function.
async function outlookDecisionClassification(responseOpenAI, input) {
  let decision = ''; // By default this is an empty string. It most likely means that something went wrong.

  // A switch to determine which set of actions to execute depending of the classification of the answer.
  switch (responseOpenAI) {
    // Get all scheduled events starting today.
    case 1:
      // Llama al endpoint indicado
      // inputFinetune = input + '\\n\\n###\\n\\n'
      // decision = questionPerficient(inputFinetune);
      break;
    // Get all scheduled events starting today, but up to the following 7 days.
    case 2:
      // Llama al endpoint indicado
      break;
    // Get all scheduled events starting today, but up to the following 31 days.
    case 3:
      // Llama al endpoint indicado
      break;
    // Schedule a meeting.
    case 4:
      console.log('Es el caso 4 de Outlook.');
      const requestStatus = await getRequestStatus(); // Gets the current request's status from the session.
      const dateAndHour = getCurrentDateAndHour(); // Gets the current date and hour.

      // If a request to schedule a meeting has not been made, it calls this function in order to start one.
      if(!requestStatus) {
        console.log('Aún no tiene una request.');
        decision = await scheduleMeeting(input, dateAndHour);
      }
      break;
    // In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".
    case 'I am sorry, can you rephrase your request?':
      decision = 'I am sorry, can you rephrase your request?';
      break;
    // In such case that something goes wrong.
    default:
      decision = '';
      break;
  }

  return decision; // Returns the response that will be displayed to the user.
}

// Function that anaylyzes the user's message in order to prepare the information to make the request to Outlook's API.
// This function is only when there is no other request going on.
async function scheduleMeeting(input, dateAndHour) {
  // This response will be displayed to the user.
  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if there is a subject, start date, and end date. If something is missing, please ask for those details, do not tell what you got, just what you are missing.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if there is a subject, start date, and end date. Consider this is the current date and hour: ${dateAndHour} , but it does not necessarily mean that this is the start date. Remember, just determine the information based on the given sentence.
    
    If something is missing, please ask for those details and return in a JSON all the required fields in order to create a meeting with the info you currently have, just return the output, without the input. I just want one pair of curly brackets. Please use camelCase for the fields. If a field is missing, write it in the JSON as null.`,
    max_tokens: 256,
    temperature: 0,
    n: 1,
    stream: false
  });

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);


  console.log('Actual JSON Outlook:', obj);

  // If the JSON has the startDate or endDate with null values, it modifies the request's status in order to indicate that a request is going on.
  if(!obj.start_date || !obj.end_date) {
    console.log('No está completa la request');
    modifyRequestStatus();
    saveCurrentService('Outlook');
  }

  saveCurrentData(obj); // Saves the current data of the current request in the session.
    
  return normalResponse.data.choices[0].text; // Returns the response that will be displayed to the user.
}

// Function that anaylyzes the user's message in order to prepare the information to make the request to Outlook's API.
// This function is only when there is a request going on.
async function scheduleMeetingContinue(input, currentData, dateAndHour) {
  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it corresponds to the missing information in this JSON (analyze if the sentence talks about specific fields, if it does not mention an end date, the endDate field must remain null) "${currentData}". And also determine if it wants to modify already existing information in that JSON. If the information in the JSON would complete, please let it know. If something else would be missing in the JSON (if there is a field with null value), please let it know too (there must not be any field with null value, analyze if the sentence talks about specific fields, if it does not mention an end date, the endDate field must remain null). Please also consider this is the current date and hour: ${dateAndHour} , but it does not necessarily mean that this is the start date or end date. Remember, just determine the information based on the given sentence.
    
    Just return the JSON, nothing else.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
        stream: false
  });

  // This response is sent to determine if the user's message completes the request.
  const determineResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this JSON "${JSONresponse}", determine if there are any fields with a null value, if it is the case, just return a number 0, if it is not, just return a number 1, only the number.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('JSON response:', JSONresponse.data.choices[0].text);

  const obj = JSON.parse(JSONresponse.data.choices[0].text.trim()); // Parses the JSON that OpenAI returns.

  console.log('Actual JSON Outlook:', obj);

  saveCurrentData(obj); // Saves the current data of the current request in the session.

  // If the user's message completes the request, it modifies the request's status and calls the function to create the meeting in Outlook.
  if(Boolean(parseInt(determineResponse.data.choices[0].text))) {
    modifyRequestStatus();
    saveCurrentService(null);
    scheduleMeetingOutlook(JSONresponse);
  }
  
  return 'Excelente, sigue así cibernauta.'; // Returns the response that will be displayed to the user.
}

async function scheduleMeetingOutlook(JSONData) {
  // Here it calls the Flask API.
  console.log('HACIENDO LA LLAMADA A FLASK');
}

// Function that modifies the the request's status from true to false and viceversa, indicating if the request is still going on or not.
async function modifyRequestStatus() {
  try {
    const response = await axios.post(`${baseURL}/modify-request-status`, null, {
      jar: cookieJar,
      withCredentials: true
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Function that saves the current data of the current request in the session.
async function saveCurrentData(currentData) {
  try {
    const payload = {
      currentData: currentData
    }

    const response = await axios.post(`${baseURL}/save-current-data`, payload, {
      jar: cookieJar,
      withCredentials: true
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Function that saves the current service of the current request in the session.
async function saveCurrentService(service) {
  try {
    const payload = {
      currentService: service
    }

    const response = await axios.post(`${baseURL}/save-current-service`, payload, {
      jar: cookieJar,
      withCredentials: true
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Function that gets the current request's status from the session.
async function getRequestStatus() {
  try {
    const response = await axios.get(`${baseURL}/get-request-status`, {
      jar: cookieJar,
      withCredentials: true
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Function that gets the current data of the current request from the session.
async function getCurrentData() {
  try {
    const response = await axios.get(`${baseURL}/get-current-data`, {
      jar: cookieJar,
      withCredentials: true
    });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

// Exports
module.exports = {
  outlookClassification,
  scheduleMeetingContinue,
};