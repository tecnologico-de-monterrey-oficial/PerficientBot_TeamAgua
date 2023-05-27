// Imports
const axios = require('axios');

// OpenAI API
const { openai, hasNullValues, mergeJSONObjects } = require('../functions/imports');

async function githubDecision(input) {
    const response = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with GitHub. Given this sentence "${input}". According to the main action of the sentence (if necessary, only focus in the main action, imagine where the action will take place considering the best platform to have it), determine which of the following options it belongs to: 

        1.- Getting all repositories.
        2.- Getting the issues of repositories. 
        3.- Getting the pull requests of repositories.
            
        Remember, there are only these 3 options, there are no others available. Just answer with the number of the option, without the period.
        Answer format: "[number]"
        Example: "2"
        
        In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your query?".`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });
    
    return githubDecisionClassification(parseInt(response.data.choices[0].text), input);
}

async function githubDecisionClassification(responseOpenAI, input) {
  let decision = ['', false, null, null]; 

  switch (responseOpenAI) {

    case 1:
      const response1 = await axios.get('http://10.22.210.77:3001/Github/Repositories').then(response => {
        console.log(response.data);
      }).catch(error => {
        console.error(error)
      });
      return [response1, false, null, null];

    case 2:
      const response2 = await axios.get(`http://10.22.210.77:3001/Github/Issues`).then(response => {
        console.log(response.data);
      }).catch(error => {
        console.error(error)
      });

      return [response2, false, null, null];

    ///Azure/CreateItem
    case 3:
      const response3 = await axios.get(`http://10.22.210.77:3001/Github/Pulls`).then(response => {
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

module.exports = {
  githubDecision
}