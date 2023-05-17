// Imports
const express = require("express");
const cors = require("cors");
const router = express.Router();

const tough = require('tough-cookie');
const axios = require('axios');
const { CookieJar } = tough;

const session = require('express-session');

const cookieJar = new CookieJar();

const { port, openai, getCurrentDateAndHour } = require('../functions/imports');

// const devops = require('../functions/devops');
// const github = require('../functions/github');
const outlook = require('../functions/outlook');

// Initial configuration
const app = express();
app.use(express.json());
app.use(cors());
// Inactive function
/* function checkInactive() {
  const currentTime = Date.now();
  const elapsedTime = currentTime - lastRequestTime;
  const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds

  if (elapsedTime > thirtyMinutes) {
    // Perform actions when no requests have been received for 30 minutes
    history = [];
  }

  // Schedule the next check after a certain interval
  setTimeout(checkInactive, thirtyMinutes);
}

checkInactive(); */

// Function that classifies the message of the user according to these 5 categories.
async function classification(input) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Microsoft tools (Outlook, GitHub, and Azure DevOps). You are also able to answer questions about the company because you have a knowledge base. Given this sentence "${input}". According to the main action of the sentence (if necessary, only focus in the main action, imagine where the action will take place considering the best platform to have it), determine which of the following options it belongs to: 

    1.- General Question about Perficient. 
    2.- Request to Outlook. 
    3.- Request to Azure DevOps. 
    4.- Request to GitHub. 
    5.- General Conversation. 
    
    Remember, there are only these 5 options, there are no others available. Just answer with the number of the option, without the period.
    Answer format: "[number]"
    Example: "2"
    
    In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return decisionClassification(parseInt(response.data.choices[0].text), input); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
}

// Function that decides which other functions to call depending on the choice that was made in the previous function.
async function decisionClassification(responseOpenAI, input) {
  let decision = ''; // By default this is an empty string. It most likely means that something went wrong, for example, the user's request cannot be made in a certain service or platform.

  // A switch to determine which set of actions to execute depending of the classification of the answer.
  switch (responseOpenAI) {
    // General Question about Perficient
    case 1:
      const inputFinetune = input + '\\n\\n###\\n\\n'; // The user's message must be concatenated with these symbols in order to for the fine-tuned model to generate a proper answer, because it was fine-tuned like that.
      decision = questionPerficient(inputFinetune); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
      break;
    // Request to Outlook
    case 2:
      const validationOutlook = await validationClassification(input, 'Outlook'); // Calls this function in order to fully assure that the user's request can be made in Outlook.
      console.log('Validacion', validationOutlook);

      // If the user's request can be made in Outlook, it calls the respective function.
      if(validationOutlook) {
        decision = await outlook.outlookClassification(input);
      }
      break;
    // Request to Azure DevOps
    case 3:
      const validationAzureDevOps = await validationClassification(input, 'AzureDevOps'); // Calls this function in order to fully assure that the user's request can be made in Azure DevOps.

      // If the user's request can be made in Azure DevOps, it calls the respective function.
      if(validationAzureDevOps) {
        decision = await requestAzureDevOps();
      }
      break;
    // Request to GitHub
    case 4:
      const validationGitHub = await validationClassification(input, 'GitHub'); // Calls this function in order to fully assure that the user's request can be made in GitHub.
      // console.log(validationGitHub);

      // If the user's request can be made in GitHub, it calls the respective function.
      if(validationGitHub) {
        decision = await requestGitHub();
      }
      break;
    // General Conversation
    case 5:
      decision = 'General Conversation.';
      break;
    // It was impossible to classify the user's message.
    case 'I am sorry, can you rephrase your request?':
      decision = 'I am sorry, can you rephrase your request?';
      break;
    // The user's request cannot be made in the platform that was classified.
    default:
      decision = '';
      break;
  }

  console.log('Decision', decision);

  return decision; // Returns the response that will be displayed to the user.
}

// Function that validates if the user's request can be made in the platform that was decided according to the previous function.
async function validationClassification(input, service) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Is it really possible to make this "${input}" happen in ${service}? Please return a boolean saying if it's 0 or 1. Just return the number.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return Boolean(parseInt(response.data.choices[0].text)); // Returns a boolean.
}

// Function that makes a request to our OpenAI fine-tuned model.
async function questionPerficient(input) {
  const response = await openai.createCompletion({
    model:'davinci:ft-personal-2023-04-28-18-40-02',
    prompt: input,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text; // Returns the response.
}

// Function that makes a request to the main function of the devops.js file.
async function requestAzureDevOps() {
  const message_bot = await 'I see that you want to create a new project in Azure DevOps.';

  return message_bot;
}

// Function that makes a request to the main function of the github.js file.
async function requestGitHub() {
  const message_bot = await 'I see that you want to create a new repository on GitHub.';

  return message_bot;
}

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Endpoint to modify the request's status of the user's session.
app.post('/modify-request-status', async (req, res) => {
  req.session.request_status = !req.session.request_status; // Changes from true to false.
  res.send('request status modified');
});

// Endpoint to save the current data of the current request that is trying to make to any platform or service.
app.post('/save-current-data', async (req, res) => {
  const { currentData } = req.body;

  // Handle the value as needed
  // console.log(`Received value:`, currentData);

  req.session.current_data = currentData; // Updates the current data in the session.

  res.send('Current data saved');
});

// Endpoint to save the current service of the current request that is trying to mkae to any platform or service.
app.post('/save-current-service', async (req, res) => {
  const { currentService } = req.body;
  console.log(`Received value: ${currentService}`);
  req.session.current_service = currentService; // Updates the current service in the session.

  // console.log('Servicio actual:', req.session.current_service);
  res.send('Current service saved');
});

// Endpoint to get the request's status of the user's session.
app.get('/get-request-status', (req, res) => {
  res.send(req.session.request_status);
});

// Endpoint to get the current data of the current request that is trying to mkae to any platform or service.
app.get('/get-current-data', (req, res) => {
  res.send(req.session.current_data);
});

// Endpoint that handles everything of the chatbot.
app.post('/', async (req, res) => {
  const { user_message } = req.body;
  const userId = req.session.id;

  // Retrieve or initialize conversation data from the session
  const conversationData = req.session.conversation || {
    messages: [],
  };

  // If the conversation data from the session has not been initialized, it assigns the variable that was previously declared.
  if(!req.session.conversation) {
    req.session.conversation = conversationData.messages;
  }

  const requestStatus = req.session.request_status || false; // Retrieve or initialize request's status data from the session.

  // If the request's status data from the session has not been initialized, it assigns the variable that was previously declared.
  if(!req.session.request_status) {
    req.session.request_status = requestStatus;
  }

  const currentData = req.session.current_data || null; // Retrieve or initialize current data of the current request to any platform or service from the session.

  // If the current data of the current request to any platform or service from the session has not been initialized, it assigns the variable that was previously declared.
  if(!req.session.current_data) {
    req.session.current_data = currentData;
  }

  const currentService = req.session.current_service || null; // Retrieve or initialize current service of the current request to any platform or service from the session.

  // If the current service from the session has not been initialized, it assigns the variable that was previously declared.
  if(!req.session.current_service) {
    req.session.current_service = currentService;
  }

  console.log('Este es el servicio actual:', req.session.current_service);
  console.log('Este es el estado de la request actual:', req.session.request_status);
  console.log('Este es el current data actual:', req.session.current_data);

  if(req.session.current_service === 'Outlook') {
    console.log('Vamos a continuar con esta request de Outlook.');

    console.log('Datos actuales', req.session.current_data);
    const dateAndHour = getCurrentDateAndHour();
    // Checks if the user's message has anything to do with the initial request
    const outlookResponse = await outlook.scheduleMeetingContinue(user_message, req.session.current_data, dateAndHour);

    req.session.conversation.push({role: "assistant", content: outlookResponse});

    console.log('Historial');
    console.log(req.session.conversation);

    res.send({ response: {role: 'assistant', content: outlookResponse}}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  const classificationResult = await classification(user_message); // Classifies the user's message.
  req.session.conversation.push({role: "user", content: user_message}); // Saves the user's message in the session's history of the conversation.

  // console.log("Último mensaje.");
  // console.log(req.session.conversation[req.session.conversation.length - 1])

  // If OpenAI classifies the user's message as General Conversation, it answers normally.
  if(classificationResult === 'General Conversation.') {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: req.session.conversation,
      max_tokens: 150,
      n: 1,
      stop: null
    });

    req.session.conversation.push(completion.data.choices[0].message); // Save OpenAI's response in the session's history of the conversation.

    console.log('Conversación General - Historial');
    console.log(req.session.conversation);

    res.send({ response: completion.data.choices[0].message }); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // If the user's request cannot be made in a certain platform or service, it returns a specific response.
  if(classificationResult === '') {
    req.session.conversation.push({role: "assistant", content: 'Please rephrase your request. Consider being clearer and more specific.'}); // Saves the response in the session's history of the conversation.
    console.log('Historial');
    console.log(req.session.conversation);

    res.send({ response: {role: 'assistant', content: 'Please rephrase your request. Consider being clearer and more specific.'}}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // If OpenAI cannot classify the user's message, it returns a specific response.
  if(classificationResult === 'I am sorry, can you rephrase your request?') {
    req.session.conversation.push({role: "assistant", content: classificationResult}); // Saves the response in the session's history of the conversation.
    console.log('Historial');
    console.log(req.session.conversation);

    res.send({ response: {role: 'assistant', content: classificationResult}}); // Returns the response to the user.

    return;
  }

  req.session.conversation.push({role: "assistant", content: classificationResult}); // Saves OpenAI's response in the session's history of the conversation.

  console.log('Historial');
  console.log(req.session.conversation);

  res.send({ response: {role: 'assistant', content: classificationResult}}); // Returns the response to the user.

  // let lastRequestTime = Date.now();
});

// Listens
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Exports
module.exports = router