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
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Microsoft tools (Outlook, GitHub, and Azure DevOps). You are also able to answer questions about the company because you have a knowledge base. Given this sentence "${input}". According to the main action of the sentence (if necessary, only focus in the main action, imagine where the action will take place considering the best platform to have it), determine which of the following options it belongs to: 

    1.- General Question about Perficient. 
    2.- Request to Outlook. 
    3.- Request to Azure DevOps. 
    4.- Request to GitHub. 
    5.- General Conversation. 
    
    Remember, there are only these 5 options, there are no others available. Just answer with the number of the option, without the period.
    Answer format: "[number]"
    Example: "2"
    
    In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your query?".`,
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
      decision = questionPerficient(input);
      break;
    case 2:
      const validationOutlook = await validationClassification(input, 'Outlook');
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
    case 'I am sorry, can you rephrase your query?':
      decision = 'I am sorry, can you rephrase your query?';
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
    prompt: `Is it really possible to make this "${input}" happen in ${service}? Is it really possible to make this "Schedule me an appointment to review our GitHub repository." happen in GitHub? Please return a boolean saying if it's 0 or 1. Just return the number.`,
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

async function requestOutlook() {
  // Aquí iría la llamada a la API de Outlook
  const message_bot = await 'I see that you want to schedule a meeting in Outlook.';

  return message_bot;
}

async function requestAzureDevOps() {
  // Aquí iría la llamada a la API de DevOps
  const message_bot = await 'I see that you want to create a new project in Azure DevOps.';

  return message_bot;
}

async function requestGitHub() {
  // Aquí iría la llamada a la API de GitHub
  const message_bot = await 'I see that you want to create a new repository on GitHub.';

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
  if(classificationResult === 'General Conversation.') {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: history,
      max_tokens: 150,
      n: 1,
      stop: null
    });

    history.push(completion.data.choices[0].message);
    console.log('Historial');
    console.log(history);

    res.send({ response: completion.data.choices[0].message });

    return;
  }

  if(classificationResult === '') {
    res.send({ response: 'Please rephrase your query. Consider being clearer and more specific.'});

    return;
  }

  if(classificationResult === 'I am sorry, can you rephrase your query?') {
    res.send({ response: classification});

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