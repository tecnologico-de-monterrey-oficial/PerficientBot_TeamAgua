// Imports
const express = require("express");
const cors = require("cors");
const router = express.Router();

const jwt = require('jsonwebtoken');
const axios = require('axios');

const { port, openai, getCurrentDateAndHour } = require('../functions/imports');

const chatbot = require('../functions/chatbot');
// const devops = require('../functions/devops');
// const github = require('../functions/github');
const outlook = require('../functions/outlook');

// Initial configuration
const app = express();
app.use(express.json());
app.use(cors());

// Middleware to authenticate the token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization.split(' ')[1];

  const secretKey = 'your_secret_key';

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Token is valid
    req.user = decoded;
    next();
  });
}

// Example function to generate a new token with updated claims
function generateNewToken(user) {
  // Generate a new JWT token with updated claims
  const secretKey = 'your_secret_key';

  const newToken = jwt.sign(user, secretKey);

  return newToken;
}

// Route to generate a token with additional variables
app.post('/login', (req, res) => {
  // In a real scenario, you would validate the user's credentials here
  const user = {
    id: 1,
    username: 'exampleUser',
    conversation: [],
    request_status: false,
    current_data: null,
    current_service: null
  };

  const secretKey = 'your_secret_key';

  // Create the JWT token with additional claims
  const token = jwt.sign(user, secretKey);

  res.json({ token });
});

// Endpoint that handles everything of the chatbot.
app.post('/', authenticateToken, async (req, res) => {
  const { user_message } = req.body;

  // If the user's message is not in English, the bot returns this message.
  if(!chatbot.EnglishOrNot(user_message)) {
    req.user.conversation.push({role: "user", content: user_message}); // Saves the user's message in the session's history of the conversation.
    req.user.conversation.push({role: "assistant", content: 'Please write in English.'}); // Saves the response in the session's history of the conversation.
    console.log('Historial- No English');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user);

    res.send({ response: {role: 'assistant', content: 'Please write in English.'}, new_token: newToken}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // Checa los demás datos de la sesión
  console.log('Este es el servicio actual:', req.user.current_service);
  console.log('Este es el estado de la request actual:', req.user.request_status);
  console.log('Este es el current data actual:', req.user.current_data);

  if(req.user.current_service === 'Outlook') {
    // TODO: Aquí íría la verificación para checar que sí se sigue hablando del mismo tema.
    console.log('Vamos a continuar con esta request de Outlook.');

    const dateAndHour = getCurrentDateAndHour();
    // Checks if the user's message has anything to do with the initial request
    const outlookResponse = await outlook.scheduleMeetingContinue(user_message, req.user.current_data, dateAndHour);

    // Saves the messages into the history of conversation
    req.user.conversation.push({role: "user", content: user_message});
    req.user.conversation.push({role: "assistant", content: outlookResponse[0]});

    req.user.current_data = outlookResponse[1];

    console.log('Historial - Outlook Service');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user);

    res.send({ response: {role: 'assistant', content: outlookResponse[0]}, new_token: newToken}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  const classificationResult = await chatbot.classification(user_message, req.user.request_status); // Classifies the user's message.
  req.user.conversation.push({role: "user", content: user_message}); // Saves the user's message in the session's history of the conversation.

  // If OpenAI classifies the user's message as General Conversation, it answers normally.
  if(classificationResult[0] === 'General Conversation.') {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: req.user.conversation,
      max_tokens: 150,
      n: 1,
      stop: null
    });

    req.user.conversation.push(completion.data.choices[0].message); // Save OpenAI's response in the session's history of the conversation.

    console.log('Conversación General - Historial');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user);

    res.send({ response: completion.data.choices[0].message, new_token: newToken }); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // If the user's request cannot be made in a certain platform or service, it returns a specific response.
  if(classificationResult[0] === '') {
    req.user.conversation.push({role: "assistant", content: 'Please rephrase your request. Consider being clearer and more specific.'}); // Saves the response in the session's history of the conversation.
    console.log('Historial');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user);

    res.send({ response: {role: 'assistant', content: 'Please rephrase your request. Consider being clearer and more specific.'}, new_token: newToken}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // If OpenAI cannot classify the user's message, it returns a specific response.
  if(classificationResult[0] === 'I am sorry, can you rephrase your request?') {
    req.user.conversation.push({role: "assistant", content: classificationResult}); // Saves the response in the session's history of the conversation.
    console.log('Historial');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user);

    res.send({ response: {role: 'assistant', content: classificationResult}, new_token: newToken}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  req.user.conversation.push({role: "assistant", content: classificationResult[0]}); // Saves OpenAI's response in the session's history of the conversation.

  console.log('Historial');
  console.log(req.user.conversation);

  req.user.request_status = classificationResult[1];
  req.user.current_data = classificationResult[2];
  req.user.current_service = classificationResult[3];

  console.log('Request Status después de asignar:', req.user.request_status);
  console.log('Current Data después de asignar:', req.user.current_data);
  console.log('Current Service después de asignar:', req.user.current_service);

  const newToken = generateNewToken(req.user);

  res.send({ response: {role: 'assistant', content: classificationResult[0]}, new_token: newToken}); // Returns the response to the user.

  // let lastRequestTime = Date.now();
});

// Listens
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Exports
module.exports = router