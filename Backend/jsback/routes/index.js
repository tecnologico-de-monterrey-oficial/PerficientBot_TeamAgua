const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const axios = require('axios');
const session = require('express-session');

// const devops = require('../functions/devops');
// const github = require('../functions/github');
// const outlook = require('../functions/outlook');

const app = express();
app.use(express.json());
app.use(cors());


require("dotenv").config({ path: '../../.env' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const port = process.env.PORT;
//const port = 3001
const openai = new OpenAIApi(configuration);

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

  return decisionClassification(parseInt(response.data.choices[0].text), input);
}

async function decisionClassification(responseOpenAI, input) {
  let decision = '';

  switch (responseOpenAI) {
    case 1:
      inputFinetune = input + '\\n\\n###\\n\\n';
      decision = questionPerficient(inputFinetune);
      break;
    case 2:
      const validationOutlook = await validationClassification(input, 'Outlook');
      console.log('Validacion', validationOutlook);
      if(validationOutlook) {
        decision = await requestOutlook();
      }
      break;
    case 3:
      const validationAzureDevOps = await validationClassification(input, 'AzureDevOps');
      if(validationAzureDevOps) {
        decision = await requestAzureDevOps();
      }
      break;
    case 4:
      const validationGitHub = await validationClassification(input, 'GitHub');
      console.log(validationGitHub);
      if(validationGitHub) {
        decision = await requestGitHub();
      }
      break;
    case 5:
      decision = 'General Conversation.';
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

async function validationClassification(input, service) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Is it really possible to make this "${input}" happen in ${service}? Please return a boolean saying if it's 0 or 1. Just return the number.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return Boolean(parseInt(response.data.choices[0].text));
}

async function questionPerficient(input) {
  const response = await openai.createCompletion({
    model:'davinci:ft-personal-2023-04-28-18-40-02',
    prompt: input,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text;
}

async function requestOutlook(input) {
  // Aquí iría la llamada a la API de Outlook
  const message_bot = await 'I see that you want to schedule a meeting in Outlook.\nPlease provide some details about it.';

  return message_bot;
}

async function requestAzureDevOps() {
  // Aquí iría la llamada a la API de DevOps
  const message_bot = await 'I see that you want to create a new project in Azure DevOps. \nPlease provide more information so I can assist you';

  return message_bot;
}

async function requestGitHub() {
  // Aquí iría la llamada a la API de GitHub
  const message_bot = await 'I see that you want to create a new repository on GitHub.';

  return message_bot;
}

// Configure session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.post('/modify-request-status', async (req, res) => {
  req.session.query_status = !req.session.query_status;
  res.send('request status modified');
});

app.post('/save-current-data', async (req, res) => {
  const { currentData } = req.body;

  // Handle the value as needed
  console.log(`Received value: ${currentData}`);

  req.session.current_data = currentData;

  res.send('Current data saved');
});

app.get('/get-request-status', (req, res) => {
  res.send(req.session.query_status);
});

app.get('/get-current-data', (req, res) => {
  res.send(req.session.current_data);
});

app.post('/clear-conversation', (req, res) => {
  // Borra la conversación actual en la sesión
  req.session.conversation = [];

  res.send('Conversación reiniciada');
});

app.post('/', async (req, res) => {
  const { user_message } = req.body;
  const userId = req.session.id;

  // Retrieve or initialize conversation data from the session
  const conversationData = req.session.conversation || {
    messages: [],
    // other conversation-related data
  };

  // Update the conversation data in the session
  if(!req.session.conversation) {
    req.session.conversation = conversationData.messages;
  }

  const queryStatus = req.session.query_status || false;

  if(!req.session.query_status) {
    req.session.query_status = queryStatus;
  }

  const currentData = req.session.current_data || '';

  if(!req.session.current_data) {
    req.session.current_data = currentData;
  }

  const classificationResult = await classification(user_message);
  req.session.conversation.push({role: "user", content: user_message});

  console.log("Último mensaje.");
  console.log(req.session.conversation[req.session.conversation.length - 1])

  // If it returns 1
  if(classificationResult === 'General Conversation.') {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: req.session.conversation,
      max_tokens: 150,
      n: 1,
      stop: null
    });

    req.session.conversation.push(completion.data.choices[0].message);
    console.log('Conversación General - Historial');
    console.log(req.session.conversation);

    res.send({ response: completion.data.choices[0].message });

    return;
  }

  if(classificationResult === '') {
    req.session.conversation.push({role: "assistant", content: 'I apologize, but I\'m having trouble understanding your request. Could you please rephrase it or provide more specific details so that I can assist you better?'});
    console.log('Historial');
    console.log(req.session.conversation);

    res.send({ response: {role: 'assistant', content: 'I apologize, but I\'m having trouble understanding your request. Could you please rephrase it or provide more specific details so that I can assist you better?'}});

    return;
  }

  if(classificationResult === 'I am sorry, can you rephrase your request?') {
    req.session.conversation.push({role: "assistant", content: classificationResult});
    console.log('Historial');
    console.log(req.session.conversation);

    res.send({ response: {role: 'assistant', content: classificationResult}});

    return;
  }

  req.session.conversation.push({role: "assistant", content: classificationResult});

  console.log('Historial');
  console.log(req.session.conversation);

  res.send({ response: {role: 'assistant', content: classificationResult}});

  // let lastRequestTime = Date.now();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = router

