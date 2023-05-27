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
      const response1 = await axios.get('http://10.22.210.77:3001/Github/Repositories').then(async response1 => {

      console.log(response1.data);
      // Handle the response from the Flask API
      //resultString = await filterResponseRepo(input, response1.data);
      finalStringResponse = formatJSONOutResponseRepo(response1.data);

      normalResponse = 'Here is your request: ' + '\n' + finalStringResponse; // Assuming the response is JSON data
      return [normalResponse, false, null, null];
      }).catch(error => {
        console.error(error)
      });

      break;

    case 2:
      const response2 = await axios.get(`http://10.22.210.77:3001/Github/Issues`).then(async response => {
      console.log(response.data);



      }).catch(error => {
        console.error(error)
      });

      return [response2, false, null, null];

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

async function filterResponseRepo(input, response) {
  const JSONResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `You are a data analist capable of exatrancting information from a given array or JSON. I want you to review this JSON: "${response}". From this, extract the values of 'name' and 'url' that you find on each main JSON from the original array.
    
    I want the output to be an array of JSONs. 

    `,
    max_tokens: 500,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('Filtrado:', JSONResponse.data.choices[0].text);

  return JSONResponse.data.choices[0].text;
}

function formatJSONOutResponseRepo(response) {
  let resultString = '';

  // Iterate over each object in the array
  response.forEach(function(obj) {
    // Iterate over each key in the object
    console.log('Objeto:', obj);

    resultString += `<a href="${obj.url}">Repository: ${obj.name}</a>
    ___________________________________________________________________`;
  });
  return resultString;
}

module.exports = {
  githubDecision
}