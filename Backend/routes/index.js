const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
const router = require("express").Router();
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());


require("dotenv").config({ path: '../.env' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const port = process.env.PORT;
const openai = new OpenAIApi(configuration);
const history = [];

async function classification(input) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Microsoft tools (Outlook, GitHub, and Azure DevOps). You are also able to answer questions about the company because you have a knowledge base. Given this sentence "${input}". According to the main action of the sentence, determine which of the following options it belongs to: 

    1.- General Question about Perficient. 
    2.- Request to Outlook. 
    3.- Request to Azure DevOps. 
    4.- Request to GitHub. 
    5.- General Conversation. 
    
    Remember, there are only these 5 options, there are no others available. Just answer with the number of the option, without the period.
    Answer format: "[number]"
    Example: "2"
    
    In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your query.".`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return decisionClassification(parseInt(response.data.choices[0].text), input);
}

function decisionClassification(responseOpenAI, input) {
  let decision = "";

  switch (responseOpenAI) {
    case 1:
      decision = questionPerficient(input);
      break;
    case 2:
      decision = requestOutlook();
      break;
    case 3:
      decision = requestAzureDevOps();
      break;
    case 4:
      decision = requestGitHub();
      break;
    case 5:
      decision = 'General Conversation.';
      break;
    default:
      decision = '';
      break;
  }

  return decision;
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

function requestOutlook() {
  // Aquí iría la llamada a la API de Outlook
  const message_bot = 'I see that you want to schedule a meeting in Outlook.';

  return message_bot;
}

function requestAzureDevOps() {
  // Aquí iría la llamada a la API de DevOps
  const message_bot = 'I see that you want to create a new project in Azure DevOps.';

  return message_bot;
}

function requestGitHub() {
  // Aquí iría la llamada a la API de GitHub
  const message_bot = 'I see that you want to create a new repository on GitHub.';

  return message_bot;
}

app.post('/', async (req, res) => {
  const { user_message } = req.body;
  const messages = [];

  history.forEach(mensajeHis => {
    messages.push(mensajeHis);
  });

  const classificationResult = await classification(user_message);
  messages.push({role: "user", content: user_message});

  console.log("Último mensaje.");
  console.log(messages[messages.length - 1])

  history.push(messages[messages.length - 1]);

  // If it returns 1
  if (classificationResult === 'General Conversation.') {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: history,
      max_tokens: 150,
      n: 1,
      stop: null
    });

    console.log('Conversación General será');

    history.push(completion.data.choices[0].message);
    console.log('Historial');
    console.log(history);

    res.send({ response: completion.data.choices[0].message });

    return;
  } 

  messages.push({role: "assistant", content: classificationResult});

  history.push(messages[messages.length - 1]);

  console.log('Historial');
  console.log(history);

  res.send({ response: classificationResult });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = router