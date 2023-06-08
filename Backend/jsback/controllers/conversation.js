const conversation = async(req, res) => {
    const { user_message, secret_key } = req.body;

    req.user.conversation.push({role: "user", content: user_message}); // Saves the user's message in the session's history of the conversation.

  // If the user's message is not in English, the bot returns this message.
  if(!chatbot.EnglishOrNot(user_message)) {
    req.user.conversation.push({role: "assistant", content: 'Please write in English.'}); // Saves the response in the session's history of the conversation.
    console.log('Historial- No English');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user, secret_key);

    res.send({ response: {role: 'assistant', content: 'Please write in English.'}, new_token: newToken}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // Checa los demás datos de la sesión
  console.log('Este es el servicio actual:', req.user.current_service);
  console.log('Este es el estado de la request actual:', req.user.request_status);
  console.log('Este es el current data actual:', req.user.current_data);

  if(req.user.current_service === 'Outlook') {
    const dateAndHour = getCurrentDateAndHour(); // Gets the current date and hour.

    // Checks if the user's message has anything to do with the initial request
    if(!outlook.checksConversationTopic(user_message, req.user.conversation, dateAndHour)) {
      const response = 'It seems that you want to change your conversation topic. I will reset your request to create a meeting and forget everything about it. If you want to create a meeting, please phrase your request from scratch. If you do not want to happen this by accident, please remember to use related words to your request.';

      req.user.conversation.push({role: "assistant", content: response}); // Saves the messages into the history of conversation

      // Updates the values of the JWT.
      req.user.request_status = false;
      req.user.current_data = null;
      req.user.current_service = null;

      console.log('Historial - Outlook Service');
      console.log(req.user.conversation);

      const newToken = generateNewToken(req.user, secret_key); // Generates a new token for the next message.

      res.send({ response: {role: 'assistant', content: response}, new_token: newToken}); // Returns the response to the user.

      return; // Ends execution of this endpoint.
    }

    if(!outlook.validatesSchedulePast(user_message, dateAndHour) || !outlook.validatesScheduleFuture(user_message, dateAndHour)) {
      const response = 'Remember, you cannot schedule a meeting in the past nor in the next 31 days. For internal logical purposes, I will reset your request to create a meeting and forget everything about it. If you want to create a meeting, please phrase your request from scratch.';

      req.user.conversation.push({role: "assistant", content: response}); // Saves the messages into the history of conversation

      // Updates the values of the JWT.
      req.user.request_status = false;
      req.user.current_data = null;
      req.user.current_service = null;

      console.log('Historial - Outlook Service');
      console.log(req.user.conversation);

      const newToken = generateNewToken(req.user, secret_key); // Generates a new token for the next message.

      res.send({ response: {role: 'assistant', content: response}, new_token: newToken}); // Returns the response to the user.

      return; // Ends execution of this endpoint.
    }

    console.log('Vamos a continuar con esta request de Outlook.');

    // Checks if the user's message has anything to do with the initial request
    const outlookResponse = await outlook.scheduleMeetingContinue(user_message, req.user.current_data, dateAndHour);

    req.user.conversation.push({role: "assistant", content: outlookResponse[0]});

    req.user.current_data = outlookResponse[1];

    console.log('Historial - Outlook Service');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user, secret_key); // Generates a new token for the next message.

    res.send({ response: {role: 'assistant', content: outlookResponse[0]}, new_token: newToken}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  const classificationResult = await chatbot.classification(user_message, req.user.request_status); // Classifies the user's message.

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

    const newToken = generateNewToken(req.user, secret_key);

    res.send({ response: completion.data.choices[0].message, new_token: newToken }); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // If the user's request cannot be made in a certain platform or service, it returns a specific response.
  if(classificationResult === '') {
    req.session.conversation.push({role: "assistant", content: 'I apologize, but I am having trouble understanding your request. Could you please rephrase it or provide more specific details so that I can assist you better?'}); // Saves the response in the session's history of the conversation.

    console.log('Historial');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user,secret_key);

    res.send({ response: {role: 'assistant', content: 'I apologize, but I am having trouble understanding your request. Could you please rephrase it or provide more specific details so that I can assist you better?'}}); // Returns the response to the user.

    return; // Ends execution of this endpoint.
  }

  // If OpenAI cannot classify the user's message, it returns a specific response.
  if(classificationResult[0] === 'I am sorry, can you rephrase your request?') {
    req.user.conversation.push({role: "assistant", content: classificationResult}); // Saves the response in the session's history of the conversation.
    console.log('Historial');
    console.log(req.user.conversation);

    const newToken = generateNewToken(req.user, secret_key);

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

  const newToken = generateNewToken(req.user, secret_key);

  res.send({ response: {role: 'assistant', content: classificationResult[0]}, new_token: newToken}); // Returns the response to the user.

  // let lastRequestTime = Date.now();
}

module.exports = conversation;