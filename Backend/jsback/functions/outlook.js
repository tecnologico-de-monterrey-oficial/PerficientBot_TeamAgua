// Imports
const axios = require('axios');

// OpenAI API
const { openai, hasNullValues } = require('../functions/imports');

// Main function that classifies the user's response in one of the options that can be made with Outlook's API.
// TODO: Si se quiere reagendar, se debería de asignar la función de eliminar y después la de crear.
async function outlookClassification(input, requestStatus, dateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine you are an AI assistant for a company named Perficient, equipped to automate tasks related to Outlook's workflow. Evaluate the provided statement, denoted as "${input}". Identify the main action within this statement, focusing solely on that if required.

    Visualize where this action would ideally take place, considering the optimal platform for execution. Then, determine which of the following options best fits the action described in the statement:
    
    1.- Retrieve all scheduled events starting today, extending to the next 7 days.
    2.- Retrieve all scheduled events starting today, extending to the next 31 days.
    3.- Arrange a new meeting.
    4.- Cancel an existing meeting.
    
    In the context of options 1-2, always prioritize optimization. For instance, if the given statement pertains to events or meetings occurring today, you should select option 1 as the best choice. Please be aware of the range date that the given statement is making reference too, for example if the given statement wants to see the events of the following two weeks, the best option should be 2 because it fits in the range of the following two weeks, on the other hand, option 1 number cannot fulfill this request because the following two does not fit in the range of the following 7 days. Consider this is the current date and time: ${dateAndHour}

    Remember, there are only these 5 options, there are no others available. Just answer with the number of the option, without the period.
    Answer format: "[number]"
    Example: "2"
    
    In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });
    
  return outlookDecisionClassification(parseInt(response.data.choices[0].text), input, requestStatus, dateAndHour); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
}

// Function that decides which other functions to call depending on the choice that was made in the previous function.
async function outlookDecisionClassification(responseOpenAI, input, requestStatus) {
  let decision = ['', false, null, null]; // By default this is an empty string. It most likely means that something went wrong.

  // A switch to determine which set of actions to execute depending of the classification of the answer.
  switch (responseOpenAI) {
    // Get all scheduled events starting today.
    case 1:
      // Llama al endpoint indicado
      return ['Debo llamar solo a los eventos de los siguientes 7 días', false, null, null];
      break;
    // Get all scheduled events starting today, but up to the following 7 days.
    case 2:
      // Llama al endpoint indicado
      return ['Debo llamar solo a los eventos de los siguientes 31 días', false, null, null];
      break;
    // Schedule a meeting.
    case 3:
      console.log('Es el caso 4 de Outlook.');

      // If a request to schedule a meeting has not been made, it calls this function in order to start one.
      if(!requestStatus) {
        console.log('Aún no tiene una request.');
        decision = await scheduleMeeting(input, dateAndHour);
      }
      break;
    case 4:
      // Llama al endpoint indicado
      return ['Debo cancelar un evento', false, null, null];
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
  if(!hasNullValues(obj)) {
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
    prompt: `As a chatbot for Perficient, you're designed to automate Outlook-related workflow tasks, like scheduling meetings. Your task is to analyze the sentence "${input}" to see if it supplies missing information for this JSON: "${currentData}". Verify whether the sentence refers to specific fields in the JSON. If the sentence does not mention an end date, keep the "endDate" field null only if it already is null in the JSON you received, if not, leave it like it was as you originally received it.

    Additionally, discern whether the sentence suggests modifications to the existing information in the JSON. The current date and time are "${dateAndHour}", but they aren't necessarily the start or end date, so please do not update those values in the new JSON unless it is strictly necessary (like as a last resource method).
    
    Your task is to update the JSON based on the given sentence, ensuring you maintain its structure and order. If a field, like 'subject', isn't mentioned in the sentence, include it in the JSON as null only if it already is null in the JSON you received, if not, leave it like it was as you originally received it. Please do not add extra fields or change field names in the JSON.
    
    You are to return the updated JSON as your response, without prefacing your answer with "The new JSON would be:". The output should strictly be the JSON.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('Antes de parsear JSON:', JSONresponse.data.choices[0].text);

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);

  console.log('Actual JSON Outlook:', obj);

  console.log('¿Está terminada o no?', determineResponse.data.choices[0].text);

  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Consider this scenario: You are an automated assistant for Perficient, a company capable of streamlining tasks related to Microsoft Outlook, including setting up meetings. Using the phrase "${input}", discern if it pertains to missing information comparing this exisitng dataset (old) "${currentData}" with this one (new) "${obj}". Investigate whether the phrase discusses certain fields. If no mention of a conclusion time is given, the corresponding field must be kept empty. Additionally, ascertain if the phrase intends to alter any data already present in the dataset. If a field is left vacant, be sure to highlight this (none of the fields should be empty, investigate whether the phrase talks about specific fields, yet if a closing time is not specified, that field must be empty). Please also remember that this is the current date and time: ${dateAndHour}.

    Your answer should avoid the use of the following terms: "JSON", "object", "sentence", "null", "startDate", "dataset", "based", "phrase" and "endDate". Your also should avoid mentioning the JSON as dataset, just call it information or somehting related.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // If the user's message completes the request, it modifies the request's status and calls the function to create the meeting in Outlook.
  if(!hasNullValues(obj)) {
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