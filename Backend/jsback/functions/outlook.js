const axios = require('axios');
const tough = require('tough-cookie');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;

axiosCookieJarSupport(axios);

const cookieJar = new tough.CookieJar();
const baseURL = 'http://localhost:3000';

export async function outlookClassification(input) {
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
    
      return outlookDecisionClassification(parseInt(response.data.choices[0].text), input);
}

async function outlookDecisionClassification(responseOpenAI, input) {
    let decision = '';

    switch (responseOpenAI) {
        case 1:
            // Llama al endpoint indicado
            // inputFinetune = input + '\\n\\n###\\n\\n'
            // decision = questionPerficient(inputFinetune);
            break;
        case 2:
            // Llama al endpoint indicado
            break;
        case 3:
            // Llama al endpoint indicado
            break;
        case 4:
            const requestStatus = await getRequestStatus();
            const dateAndHour = getCurrentDateAndHour();

            if(!requestStatus) {
                decision = await scheduleMeeting(input, dateAndHour);
            } else {
                const currentData = await getCurrentData();
                decision = await scheduleMeetingContinue(input, currentData, dateAndHour);
            }
            break;
        case 'I am sorry, can you rephrase your request?':
            decision = 'I am sorry, can you rephrase your request?';
            break;
        default:
        decision = '';
        break;
  }

  console.log('Decision', decision);

  return decision;
}

async function scheduleMeeting(input, dateAndHour) {
    const normalResponse = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if there is a subject, start date, and end date. If something is missing, please ask for those details.`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });

      const JSONresponse = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if there is a subject, start date, and end date. Consider this is the current date and hour: ${dateAndHour}
        
        If something is missing, please ask for those details and return in a JSON all the required fields in order to create a meeting with the info you currently have, just return the output, without the input. I just want one pair of curly brackets. Please use Snake Case for the fields. If a field is missing, write it in the JSON as null.`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });

      const obj = JSON.parse(JSONresponse.data.choices[0].text);

      if(!obj.start_date || !obj.end_date) {
        modifyQueryStatus();
      }

      saveCurrentData(obj);
    
      return normalResponse;
}

async function scheduleMeetingContinue(input, currentData, dateAndHour) {
      const JSONresponse = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it corresponds to the missing information in this JSON (analyze if the sentence talks about specific fields, if it does not mention an end date, the end_date field must remain null) "${currentData}". And also determine if it wants to modify already existing information in that JSON. If the information in the JSON would complete, please let it know. If something else would be missing in the JSON (if there is a field with null value), please let it know too (there must not be any field with null value, analyze if the sentence talks about specific fields, if it does not mention an end date, the end_date field must remain null). Please also consider this is the current date and hour: ${dateAndHour}
            
        Just return the JSON, nothing else.`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });

      const determineResponse = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this JSON "${JSONresponse}", determine if there are any fields with a null value, if it is the case, just return a number 0, if it is not, just return a number 1, only the number.`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });

      const obj = JSON.parse(JSONresponse.data.choices[0].text);

      if(!obj.start_date || !obj.end_date) {
        modifyRequestStatus();
      }

      saveCurrentData(obj);
    
      return normalResponse;
}

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

function getCurrentDateAndHour() {
    // Create a new Date object
    const currentDate = new Date();

    // Get the current date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Get the current hour
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Print the current date and hour
    console.log(`Current date: ${year}-${month}-${day}`);
    console.log(`Current time: ${hours}:${minutes}:${seconds}`);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}