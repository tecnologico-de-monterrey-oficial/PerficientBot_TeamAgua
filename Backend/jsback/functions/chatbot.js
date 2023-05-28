// OpenAI API
const { openai, getCurrentDateAndHour } = require('../functions/imports');
const outlook = require('./outlook');
const devops = require('./devops');
const github = require('./github');

async function EnglishOrNot(input) {
    const response = await openai.createCompletion({
      model:'text-davinci-003',
      prompt: `Identify if this text "I want to schedule a meeting tomorrow about "${input}" is mainly in English or not, ignore if there is some text in other language inside quotation marks. If it is in English, please return a number 1, if it is not return 0, just the number, nothing else.`,
      max_tokens: 150,
      temperature: 0,
      n: 1,
      stream: false
    });
  
    return Boolean(parseInt(response.data.choices[0].text)); // Returns the boolean.
  }
  
  // Function that classifies the message of the user according to these 5 categories.
  async function classification(input, requestStatus) {
    console.log('Input recibido en clasificación.', input);

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
  
    return decisionClassification(parseInt(response.data.choices[0].text), input, requestStatus); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
  }
  
  // Function that decides which other functions to call depending on the choice that was made in the previous function.
  async function decisionClassification(responseOpenAI, input, requestStatus) {
    let decision = ['', false, null, null]; // By default this is an empty string. It most likely means that something went wrong, for example, the user's request cannot be made in a certain service or platform.
  
    // A switch to determine which set of actions to execute depending of the classification of the answer.
    switch (responseOpenAI) {
      // General Question about Perficient
      case 1:
        console.log('La pregunta va para nuestro bot entrenado.');
        const inputForFineTune = input + '\\n\\n###\\n\\n'; // The user's message must be concatenated with these symbols in order to for the fine-tuned model to generate a proper answer, because it was fine-tuned like that.
        
        const finetunedResponse = await questionPerficient(inputForFineTune);

        decision = [finetunedResponse, false, null, null]; // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
        break;
      // Request to Outlook
      case 2:
        const validationOutlook = await validationClassification(input, 'Outlook'); // Calls this function in order to fully assure that the user's request can be made in Outlook.
        console.log('Validacion', validationOutlook);
  
        // If the user's request can be made in Outlook, it calls the respective function.
        if(validationOutlook) {
            dateAndHour = getCurrentDateAndHour();
            decision = await outlook.outlookClassification(input, requestStatus, dateAndHour);
        }
        break;
      // Request to Azure DevOps
      case 3:
        const validationAzureDevOps = await validationClassification(input, 'AzureDevOps'); // Calls this function in order to fully assure that the user's request can be made in Azure DevOps.
  
        // If the user's request can be made in Azure DevOps, it calls the respective function.
        if(validationAzureDevOps) {
          decision = await devops.azureClassification(input, requestStatus);
        }
        break;
      // Request to GitHub
      case 4:
        const validationGitHub = await validationClassification(input, 'GitHub'); // Calls this function in order to fully assure that the user's request can be made in GitHub.
        // console.log(validationGitHub);
  
        // If the user's request can be made in GitHub, it calls the respective function.
        if(validationGitHub) {
          decision = await github.githubDecision(input);
        }
        break;
      // General Conversation
      case 5:
        decision = ['General Conversation.', false, null, null];
        break;
      // It was impossible to classify the user's message.
      case 'I am sorry, can you rephrase your request?':
        decision = ['I am sorry, can you rephrase your request?', false, null, null];
        break;
      // The user's request cannot be made in the platform that was classified.
      default:
        decision = ['', false, null, null];
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
      model:'davinci:ft-personal-2023-05-28-01-26-43',
      prompt: input,
      max_tokens: 150,
      temperature: 0,
      stop: '###',
      n: 1,
      stream: false
    });

    console.log(response.data.choices[0].text);
  
    return response.data.choices[0].text; // Returns the response.
}

  // Exports
module.exports = {
    EnglishOrNot,
    classification
  };