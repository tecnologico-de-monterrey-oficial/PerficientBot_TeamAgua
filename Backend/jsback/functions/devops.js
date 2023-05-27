// Imports
const axios = require('axios');

// OpenAI API
const { openai, hasNullValues, mergeJSONObjects } = require('../functions/imports');

async function azureClassification(input, requestStatus) {
    const response = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Azure DevOps. Given this sentence "${input}". According to the main action of the sentence (if necessary, only focus in the main action, imagine where the action will take place considering the best platform to have it), determine which of the following options it belongs to: 

        1.- Get all work items.
        2.- Get work item given the ID
        3.- Create a work item.
            
        Remember, there are only these 3 options, there are no others available. Just answer with the number of the option, without the period.
        Answer format: "[number]"
        Example: "2"
        
        In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your query?".`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });
    
    return AzureDecisionClassification(parseInt(response.data.choices[0].text), input, requestStatus);
}

async function AzureDecisionClassification(responseOpenAI, input, requestStatus) {
  let decision = ['', false, null, null]; 

  switch (responseOpenAI) {

    case 1:
      const response1 = await axios.get('http://10.22.210.77:3001/Azure/AllWI').then(response => {
        console.log(response.data);
      }).catch(error => {
        console.error(error)
      });
      return [response1, false, null, null];

    case 2:
      if(!requestStatus) {
        console.log('Aún no tiene una request.');
        decision = await getWorkItem(input);
      }

      const response2 = await axios.get(`http://10.22.210.77:3001/Azure/WI/${decision[2]['id']}`).then(response => {
        console.log(response.data);
      }).catch(error => {
        console.error(error)
      });

      return [response2, false, null, null];

    ///Azure/CreateItem
    case 3:
      if(!requestStatus) {
        console.log('Aún no tiene una request.');
        decision = await CreateWorkItem(input);
      }

      payload = decision[2]
      const response3 = await axios.post(`http://10.22.210.77:3001/Azure/CreateItem`, payload ).then(response => {
        console.log(response.data);
      }).catch(error => {
        console.error(error)
      });

      return [response3, false, null, null];

    case 'I am sorry, can you rephrase your request?':
      decision = ['I am sorry, can you rephrase your request?', false, null, null];
      break;

    default:
      decision = ['', false, null, null];
      break;
  }

  return decision;
}

async function getWorkItem(input) {
  // This response will be displayed to the user.
  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Azure DevOps. In this case your task is to identify the ID of a work item. Given this sentence "${input}", determine if there is an id. If it is missing, please ask again.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Azure DevOps. In this case your task is to identify the ID of a work item. Given this sentence "${input}", determine if there is an ID. Remember, just determine the information based on the given sentence.
    
   If no ID number is given, write it in the JSON as null. Return the JSON with format {"id": givenValue} - the output should be the JSON and nothing else.`,
    max_tokens: 256,
    temperature: 0,
    n: 1,
    stream: false
  });

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);


  console.log('Actual JSON Azure:', obj);

  // These are the defualt values in case the request is completed in one single message.
  let requestStatus = false;
  let currentService = null;

  // If the JSON has at least a field with null value, it modifies the request's status in order to indicate that a request is going on.
  if(hasNullValues(obj)) {
    console.log('No está completa la request');
    requestStatus = true;
    currentService = 'AzureDevOps';
    return [normalResponse.data.choices[0].text, requestStatus, obj, currentService]; // Returns the response that will be displayed to the user.
  }

  return [null, requestStatus, obj, currentService];
}

async function CreateWorkItem(input) {
  // This response will be displayed to the user.
  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Azure DevOps. In this case your task is to create a work item. Given this sentence "${input}", determine if there is a title, description, and type of work item. The type of work items are Task, User Story, Epic and Test Design. If something is missing, please ask for those details, do not tell what you got, just what you are missing.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Azure DevOps. In this case your task is to create a work item. Given this sentence "${input}", determine if there is a title, description, and type of work item. The type of work items are Task, User Story, Epic and Test Design. Remember, just determine the information based on the given sentence.
    
    Please use camelCase for the fields. If a field is missing, write it in the JSON as null. Return the JSON without any prefacing statement - the output should be the JSON and nothing else.`,
    max_tokens: 256,
    temperature: 0,
    n: 1,
    stream: false
  });

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);


  console.log('Actual JSON Azure:', obj);

  // These are the defualt values in case the request is completed in one single message.
  let requestStatus = false;
  let currentService = null;

  // If the JSON has at least a field with null value, it modifies the request's status in order to indicate that a request is going on.
  if(hasNullValues(obj)) {
    console.log('No está completa la request');
    requestStatus = true;
    currentService = 'AzureDevOps';
    return [normalResponse.data.choices[0].text, requestStatus, obj, currentService]; // Returns the response that will be displayed to the user.
  }

  return [null, requestStatus, obj, currentService];
}

module.exports = {
  azureClassification
}