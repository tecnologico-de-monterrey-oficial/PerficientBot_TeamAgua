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
      const response1 = await axios.get('http://127.0.0.1:3001/Github/Repositories').then(async response1 => {
      console.log(response1.data);
      finalStringResponse = formatJSONOutResponseRepo(response1.data);

      normalResponse = 'Here is your request: ' + '<br>' + finalStringResponse + '<br><br>'; // Assuming the response is JSON data
      return [normalResponse, false, null, null];
      }).catch(error => {
        console.error(error)
      });

      decision = [normalResponse, false, null, null];
      break;

    case 2:
      const response2 = await axios.get(`http://127.0.0.1:3001/Github/Issues`).then(async response2 => {
      console.log(response2.data);
      finalStringResponse = formatJSONOutResponse(response2.data);

      normalResponse = 'Here is your request: ' + '<br>' + finalStringResponse + '<br>'; // Assuming the response is JSON data
      return [normalResponse, false, null, null];
      }).catch(error => {
        console.error(error)
      });

      decision = [normalResponse, false, null, null];
      break;

    case 3:
      const response3 = await axios.get(`http://127.0.0.1:3001/Github/Pulls`).then(async response3 => {
      console.log(response3.data);
      finalStringResponse = formatJSONOutResponsePull(response3.data);

      normalResponse = 'Here is your request: ' + '<br>' + finalStringResponse + '<br><br>'; // Assuming the response is JSON data
      return [normalResponse, false, null, null];
      }).catch(error => {
        console.error(error)
      });

      decision = [normalResponse, false, null, null];
      break;

    case 'I am sorry, can you rephrase your request?':
      decision = ['I am sorry, can you rephrase your request?', false, null, null];
      break;

    default:
      decision = ['', false, null, null];
      break;
  }

  return decision;
}

function formatJSONOutResponseRepo(response) {
  let resultString = '';

  // Iterate over each object in the array
  response.forEach(function(obj) {
    // Iterate over each key in the object
    console.log('Objeto:', obj);

    
    resultString += `<hr><img src="./assets/img/Repository.svg" class="withIcon" alt="">
    <a href="${obj.url}" target="_blank" class="withLinks">${obj.name} <img src="./assets/img/Link.svg" class="withGo" alt=""> </a>
    `;
  });
  return resultString;
}

function formatJSONOutResponse(response) {
  let resultString = '';

  // Iterate over each object in the array
  response.forEach(function(obj) {
    // Iterate over each key in the object
    console.log('Objeto:', obj);

    resultString += `<hr><img src="./assets/img/GitHub.svg" class="withIcon" alt=""> Issue title: 
    <a href="${obj.url}" target="_blank" class="withLinks"> ${obj.title} 
    <img src="./assets/img/Link.svg" class="withGo" alt=""> 
    </a> <br>
    <img src="./assets/img/Description.svg" class="withIcon" alt=""> Description: <i>${obj.body}</i>
    `;
  });
  return resultString;
}

//Added specific function for pull requests
function formatJSONOutResponsePull(response) {
  let resultString = '';

  // Iterate over each object in the array
  response.forEach(function(obj) {
    // Iterate over each key in the object
    console.log('Objeto:', obj);

    resultString += `<hr><img src="./assets/img/Pull Request.svg" class="withIcon" alt=""> Pull request: 
    <a href="${obj.url}" target="_blank" class="withLinks"> ${obj.title} 
    <img src="./assets/img/Link.svg" class="withGo" alt=""> 
    </a> <br>
    <img src="./assets/img/Description.svg" class="withIcon" alt=""> Description: <i>${obj.body}</i>
    `;
  });
  return resultString;
}

module.exports = {
  githubDecision
}