// Imports
const axios = require('axios');

// OpenAI API
const { openai, getCurrentDateAndHour } = require('../functions/imports');

// Main function that classifies the user's response in one of the options that can be made with Outlook's API.
async function outlookClassification(input, requestStatus) {
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
    
  return outlookDecisionClassification(parseInt(response.data.choices[0].text), input, requestStatus); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
}

// Function that decides which other functions to call depending on the choice that was made in the previous function.
async function outlookDecisionClassification(responseOpenAI, input, requestStatus) {
  let decision = ['', false, null, null]; // By default this is an empty string. It most likely means that something went wrong.

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
      const dateAndHour = getCurrentDateAndHour(); // Gets the current date and hour.

      // If a request to schedule a meeting has not been made, it calls this function in order to start one.
      if(!requestStatus) {
        console.log('Aún no tiene una request.');
        decision = await scheduleMeeting(input, dateAndHour);
      }
      break;
    // In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".
    case 'I am sorry, can you rephrase your request?':
      decision = ['I am sorry, can you rephrase your request?', false, null, null];
      break;
    // In such case that something goes wrong.
    default:
      decision = ['', false, null, null];
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

  let requestStatus = false;
  let currentService = null;


  // If the JSON has the startDate or endDate with null values, it modifies the request's status in order to indicate that a request is going on.
  if(!obj.start_date || !obj.end_date) {
    console.log('No está completa la request');
    requestStatus = true;
    currentService = 'Outlook';
  }
    
  return [normalResponse.data.choices[0].text, requestStatus, obj, currentService]; // Returns the response that will be displayed to the user.
}

// Function that anaylyzes the user's message in order to prepare the information to make the request to Outlook's API.
// This function is only when there is a request going on.
async function scheduleMeetingContinue(input, currentData, dateAndHour) {
  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it corresponds to the missing information in this JSON (analyze if the sentence talks about specific fields, if it does not mention an end date, the endDate field must remain null) "${currentData}". And also determine if it wants to modify already existing information in that JSON. Please also consider this is the current date and hour: ${dateAndHour} , but it does not necessarily mean that this is the start date or end date. Remember, just determine the information based on the given sentence and the current JSON. Please do not omit any of the fields and do not change their name in the new JSON. Keep the same structure and order as in the current JSON, just update the values according to the given sentence. For example, if in this sentence you are receving, yo do not see the subject of the meeting in the given sentence, please still include that field in the new JSON as null. Please do not include additional fields in the new JSON (respect the fields that are in the current JSON). I do not want extra fields in the new JSON. Please do not change the name of the fields in the new JSON:

    Just return the JSON, nothing else. Please do not start your answer with "The new JSON would be:". I just want the JSON.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('Antes de JSON response');
  console.log('JSON response:', JSONresponse.data.choices[0].text.trim());
  console.log('Después de JSON response');

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);

  console.log('Actual JSON Outlook:', obj);

  // This response is sent to determine if the user's message completes the request.
  const determineResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Given this JSON "${obj}", if there is at least one field in the JSON object with a value of 'null', return the integer 0. Conversely, if there are no fields with a 'null' value within the JSON object, return the integer 1.

    Note that only a numerical value should be returned, with no additional formatting or message text. Your answer must be only one digit and nothing else.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('¿Está terminada o no?', determineResponse.data.choices[0].text);

  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Consider this scenario: You are an automated assistant for Perficient, a company capable of streamlining tasks related to Microsoft Outlook, including setting up meetings. Using the phrase "${input}", discern if it pertains to missing information in this existing dataset "${currentData}". Investigate whether the phrase discusses certain fields. If no mention of a conclusion time is given, the corresponding field must be kept empty. Additionally, ascertain if the phrase intends to alter any data already present in the dataset. If a field is left vacant, be sure to highlight this (none of the fields should be empty, investigate whether the phrase talks about specific fields, yet if a closing time is not specified, that field must be empty). Please also remember that this is the current date and time: ${dateAndHour}.

    Your answer should avoid the use of the following terms: "JSON", "object", "sentence", "null", "startDate", and "endDate".`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // saveCurrentData(obj); // Saves the current data of the current request in the session.

  // If the user's message completes the request, it modifies the request's status and calls the function to create the meeting in Outlook.
  if(Boolean(parseInt(determineResponse.data.choices[0].text))) {
    // modifyRequestStatus();
    // saveCurrentService(null);
    scheduleMeetingOutlook(obj);
    return ['Request a Outlook terminada', obj];
  }
  
  return [normalResponse.data.choices[0].text, obj]; // Returns the response that will be displayed to the user.
}

async function scheduleMeetingOutlook(JSONData) {
  // Here it calls the Flask API.
  console.log('HACIENDO LA LLAMADA A FLASK');
}

// Exports
module.exports = {
  outlookClassification,
  scheduleMeetingContinue,
};