// Imports
const axios = require('axios');

// OpenAI API
const { openai, hasNullValues, mergeJSONObjects } = require('../functions/imports');

// Main function that classifies the user's response in one of the options that can be made with Outlook's API.
async function outlookClassification(input, requestStatus, dateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine you are an AI assistant for a company named Perficient, equipped to automate tasks related to Outlook's workflow. Evaluate the provided statement, denoted as "${input}". Identify the main action within this statement, focusing solely on that if required.

    Visualize where this action would ideally take place, considering the optimal option for execution. Then, determine which of the following options best fits the action described in the statement:
    
    1.- Retrieve scheduled events starting today.
    2.- Arrange a new meeting.
    3.- Check the availability of your colleagues.
    
    Consider this is the current date and time: ${dateAndHour}

    Remember, there are only these 5 options, there are no others available. Just answer with the number of the option, without the period.
    Answer format: "[number]"
    Example: "2"
    
    In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // TODO: Preguntar por la disponibilidad de compañeros.
    
  return outlookDecisionClassification(parseInt(response.data.choices[0].text), input, requestStatus, dateAndHour); // Calls this function in order to get the response of OpenAI. This is the message that will be displayed to the user.
}

// Function that decides which other functions to call depending on the choice that was made in the previous function.
async function outlookDecisionClassification(responseOpenAI, input, requestStatus, dateAndHour) {
  let decision = ['', false, null, null]; // By default this is an empty string. It most likely means that something went wrong.

  // A switch to determine which set of actions to execute depending of the classification of the answer.
  switch (responseOpenAI) {
    // Get all scheduled events starting today.
    case 1:
      // Validates
      const validationPast = await validatesGetPast(input, dateAndHour);
      const validationFuture = await validatesGetFuture(input, dateAndHour);

      console.log('Validación GET pasado:', validationPast);
      console.log('Validación GET futuro:', validationFuture);

      if(!validationPast || !validationFuture) {
        decision = ['Remember, you cannot request to see past events nor events that past 7 days from today.', false, null, null];
        break;
      }

      let normalResponse = '';
      let resultString = '';
      
      // Make a GET request to the Flask API
      const response = await axios.get('http://127.0.0.1:3001/Outlook/WeekEvents')
      .then(async response => {
        console.log(response.data);
        // Handle the response from the Flask API
        // resultString = await filterResponse(input, response.data, dateAndHour);
        // finalStringResponse = formatJSONOutResponse(resultString);
        resultString = formatJSONOutResponse(response.data);

        normalResponse = 'Here is your request: ' + '\n' + resultString; // Assuming the response is JSON data
      })
      .catch(error => {
        // Handle any errors that occurred during the request
        normalResponse = 'There was a some sort of error. Please try again.';
      });

      decision = [normalResponse, false, null, null];
      break;
    // Schedule a meeting.
    case 2:
      // If a request to schedule a meeting has not been made, it calls this function in order to start one.
      if(!requestStatus) {
        console.log('Aún no tiene una request.');
        // Validates
        const validationSchedulePast = await validatesSchedulePast(input, dateAndHour);
        const validationScheduleFuture = await validatesScheduleFuture(input, dateAndHour);

        console.log('Validación Schedule pasado:', validationSchedulePast);
        console.log('Validación Schedule futuro:', validationScheduleFuture);

        if(!validationSchedulePast || !validationScheduleFuture) {
          decision = ['Remember, you cannot schedule a meeting in the past nor in the next 31 days.', false, null, null];
          break;
        }

        decision = await scheduleMeeting(input, dateAndHour);
      }
      break;
    // Check the availability of your colleagues.
    case 3:
      // Validates
      const validationCheckColleague = await validatesCheckColleague(input, dateAndHour);

      if(validationCheckColleague) {
        decision = ['This is the availability of your colleagues: ', false, null, null];
      } else {
        decision = ['Remember, as this is a complicated request, please write anything in one message. If you want to check a colleague\'s availability, please refer to that person with their e-mail. Please also include in your message a start and end date and hour.', false, null, null];
      }
      break;
    // In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your request?".
    case 'I am sorry, can you rephrase your request?':
      decision = ['I am sorry, can you rephrase your request?', false, null, null];
      break;
    // In such case that something goes wrong.
    default:
      decision = ['', false, null, null];
      break;
  }

  return decision; // Returns the response that will be displayed to the user.
}

// Function that anaylyzes the user's message in order to prepare the information to make the request to Outlook's API.
// This function is only when there is no other request going on.
async function scheduleMeeting(input, dateAndHour) {
  // This response will be displayed to the user.
  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if there is a subject, start date, and end date. If something is missing, please ask for those details, do not tell what you got, just what you are missing.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if there is a subject, start date, and end date. Consider this is the current date and hour: ${dateAndHour} , but it does not necessarily mean that this is the start date. Remember, just determine the information based on the given sentence.
    
    Please use camelCase for the fields. If a field is missing, write it in the JSON as null. Return the JSON without any prefacing statement - the output should be the JSON and nothing else.`,
    max_tokens: 256,
    temperature: 0,
    n: 1,
    stream: false
  });

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);


  console.log('Actual JSON Outlook:', obj);

  // These are the defualt values in case the request is completed in one single message.
  let requestStatus = false;
  let currentService = null;

  // If the JSON has at least a field with null value, it modifies the request's status in order to indicate that a request is going on.
  if(hasNullValues(obj)) {
    console.log('No está completa la request');
    requestStatus = true;
    currentService = 'Outlook';
    return [normalResponse.data.choices[0].text, requestStatus, obj, currentService]; // Returns the response that will be displayed to the user.
  }

  // If the JSON has all fields with a value, it modifies the JSON itself in order to send it to the Outlook API.
  const correctedTimeJSON = correctTimeFormat(obj);

  const postResponse = scheduleMeetingOutlook(correctedTimeJSON);

  const confirmResponse = displayMeetingInfo(correctTimeFormat, postResponse.url);

  return [confirmResponse, requestStatus, correctedTimeJSON, currentService];
}

// Function that anaylyzes the user's message in order to prepare the information to make the request to Outlook's API.
// This function is only when there is a request going on.
async function scheduleMeetingContinue(input, currentData, dateAndHour) {
  // This response is sent to the function that creates a meeting in Outlook.
  const JSONresponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `As a chatbot for Perficient, you're designed to automate Outlook-related workflow tasks, like scheduling meetings. Your task is to analyze the sentence "${input}" to see if it supplies missing information for this JSON: "${currentData}". Verify whether the sentence refers to specific fields in the JSON. If the sentence does not mention an end date, keep the "endDate" field null only if it already is null in the JSON you received, if not, leave it like it was as you originally received it.

    Additionally, discern whether the sentence suggests modifications to the existing information in the JSON. The current date and time are "${dateAndHour}", but they aren't the startDate or endDate, so please do not update those values in the new JSON with the current date and time.
    
    Your task is to update the JSON based on the given sentence, ensuring you maintain its structure and order. If a field, like 'subject', isn't mentioned in the sentence, include it in the JSON as null only if it already is null in the JSON you received, if not, leave it like it was as you originally received it. Please do not add extra fields or change field names in the JSON. Remember to put the startDate and endDate values in the format you were given.
    
    Return the updated JSON without any prefacing statement - the output should be the JSON and nothing else.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('Antes de parsear JSON:', JSONresponse.data.choices[0].text);

  // Parses the JSON that OpenAI returns.
  const jsonString = JSONresponse.data.choices[0].text.trim();
  const fixedJsonString = jsonString.replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
  const obj = JSON.parse(fixedJsonString);

  console.log('Actual JSON Outlook:', obj);

  // Merge JSONs
  const mergedJSON = mergeJSONObjects(currentData, obj);
  console.log('JSON merge:', mergedJSON);

  // If the user's message completes the request, it modifies the request's status and calls the function to create the meeting in Outlook.
  if(hasNullValues(mergedJSON)) {
    const normalResponse = await openai.createCompletion({
      model:'text-davinci-003',
      prompt: `Consider this scenario: You are an automated assistant for Perficient, a company capable of streamlining tasks related to Microsoft Outlook, including setting up meetings. Using the phrase "${input}", discern if it pertains to missing information comparing this exisitng dataset (old) "${currentData}" with this one (new) "${mergedJSON}". Investigate whether the phrase discusses certain fields. If no mention of a conclusion time is given, the corresponding field must be kept empty. Additionally, ascertain if the phrase intends to alter any data already present in the dataset. If a field is left vacant, be sure to highlight this (none of the fields should be empty, investigate whether the phrase talks about specific fields, yet if a closing time is not specified, that field must be empty). Please also remember that this is the current date and time: ${dateAndHour}.
  
      Your answer should avoid the use of the following terms: "JSON", "object", "sentence", "null", "startDate", "dataset", "based", "phrase" and "endDate". You also should avoid mentioning the JSON as dataset, just call it information or somehting related.`,
      max_tokens: 150,
      temperature: 0,
      n: 1,
      stream: false
    });

    return [normalResponse.data.choices[0].text, mergedJSON]; // Returns the response that will be displayed to the user.
  }

  // If the JSON has all fields with a value, it modifies the JSON itself in order to send it to the Outlook API.
  const correctedTimeJSON = correctTimeFormat(mergedJSON);

  const postResponse = scheduleMeetingOutlook(correctedTimeJSON);

  const confirmResponse = displayMeetingInfo(correctedTimeJSON, postResponse.url);

  return [confirmResponse, mergedJSON];
}

// Function that corrects the time format in the JSON.
function correctTimeFormat(input) {
  if (input.startDate && input.endDate) {
    input.startDate = input.startDate.slice(0, -5) + ".099Z";
    input.endDate = input.endDate.slice(0, -5) + ".099Z";
  }
  return input;
}

// Function that divides the value of the startDate or endDate in two strings, one for the date, and the other for the time.
function splitStringByT(str) {
  const index = str.indexOf('T');
  
  if (index === -1) {
    // 'T' not found in the string
    return [str, ''];
  }
  
  const firstHalf = str.slice(0, index);
  const secondHalf = str.slice(index + 1);
  
  return [firstHalf, secondHalf];
}

// Function that removes the last 5 characters of a string in order to display in a more natural way the times of the JSON of the meeting.
function removeLastFiveCharacters(str) {
  if (str.length <= 5) {
    return '';
  } else {
    return str.slice(0, -5);
  }
}

// Function that removes the last 8 characters of a string in order to display in a more natural way the times of the JSON of the meeting.
function removeLastEightCharacters(str) {
  if (str.length <= 8) {
    return '';
  } else {
    return str.slice(0, -8);
  }
}

// Function that displays the information of the meeting in a more natural way.
function displayMeetingInfo(currentData, url) {
  const startDateTime = splitStringByT(currentData.startDate);
  const startDate = startDateTime[0];
  const startTime = removeLastFiveCharacters(startDateTime[1]);

  const endDateTime = splitStringByT(currentData.endDate);
  const endDate = endDateTime[0];
  const endTime = removeLastFiveCharacters(endDateTime[1]);

  return `You can view in Outlook in detail the creation of the meeting you requested with the following information:
  Subject: <a href="${url}>"${currentData.subject}></a>
  Start Date: ${startDate} | ${startTime} UTC
  End Date: ${endDate} | ${endTime} UTC`;
}

async function checksConversationTopic(input, currentData, currentDateAndHour) {
  const normalResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it has to do anything with creating the meeting. For more context, this is the the current JSON to create the meeting "${currentData}", and this is the current date and time: ${currentDateAndHour}
    
    Please return just the integer 0 in case the given sentence is not related with creating the current meeting. If it is not the case, please just return the integer 1. Remember that your answer must exlcusively the integer. Its length must be one character.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return normalResponse.data.choices[0].text;
}

async function validatesGetPast(input, currentDateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to get the information of specific meetings. Given this sentence "${input}", determine if it possible or logical to schedule considering you cannot get information of previous meetings. This is the current date and time: ${currentDateAndHour}
    
    Please return just the integer 0 it would not be possible or logical to complete that request. If it is not the case, please just return the integer 1. Remember that your answer must exlcusively the integer. Its length must be one character.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text;
}

async function validatesGetFuture(input, currentDateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to get the information of specific meetings. Given this sentence "${input}", determine if it possible or logical to schedule considering you cannot get information of meetings past 7 days from today. This is the current date and time: ${currentDateAndHour}
    
    Please return just the integer 0 it would not be possible or logical to complete that request. If it is not the case, please just return the integer 1. Remember that your answer must exlcusively the integer. Its length must be one character.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text;
}

async function validatesSchedulePast(input, currentDateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it possible or logical to schedule considering this is the current date and time: ${currentDateAndHour}
    
    Please return just the integer 0 it would not be possible or logical to schedule the current meeting. If it is not the case, please just return the integer 1. Remember that your answer must exlcusively the integer. Its length must be one character.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text;
}

async function validatesScheduleFuture(input, currentDateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it possible or logical to schedule considering you cannot schedule meetings past 31 days from today. This is the current date and time: ${currentDateAndHour}
    Please return just the integer 0 it would not be possible or logical to schedule the current meeting. If it is not the case, please just return the integer 1. Remember that your answer must exlcusively the integer. Its length must be one character.`,
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text;
}

async function validatesCheckColleague(input, dateAndHour) {
  const response = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. In this case your task is to create a meeting. Given this sentence "${input}", determine if it is possible to schedule a meeting with a colleague considering this JSON can be filled:

    {
      "attendees": [
        {"emailAddress": {"address": "A00831316@tec.mx"}},
        {"emailAddress": {"address": "A01411625@tec.mx"}}
      ],
      "startDateTime": "2023-05-24T09:00:00",
      "finishDateTime": "2023-05-26T09:00:00",
      "duration": "PT1H"
    }

    This is the explanation of that example:
    This JSON represents an event or meeting with the following properties:

    1. 'attendees': It is an array containing information about the attendees of the event. Each attendee is represented as an object with a property 'emailAddress', which itself is an object containing the email address of the attendee. In this example, there are two attendees with email addresses "A00831316@tec.mx" and "A01411625@tec.mx".

    2. 'startDateTime': It represents the start date and time of the event. The value "2023-05-24T09:00:00" indicates that the event starts on May 24, 2023, at 09:00:00 (in 24-hour format).

    3. 'finishDateTime': It represents the end date and time of the event. The value "2023-05-26T09:00:00" indicates that the event finishes on May 26, 2023, at 09:00:00 (in 24-hour format).

    4. 'duration': It represents the duration of the event. The value "PT1H" indicates that the event lasts for 1 hour. The duration is specified using the ISO 8601 duration format, where "PT" stands for "period of time" and "1H" represents 1 hour.


    Consider this is the current date and time: ${{dateAndHour}}

    Please return just the integer 0 it would not be possible to schedule the current meeting. If it is not the case, please just return the integer 1. Remember that your answer must exlcusively the integer. Its length must be one character.`,
    
    max_tokens: 150,
    temperature: 0,
    n: 1,
    stream: false
  });

  return response.data.choices[0].text;
}

async function filterResponse(input, response, currentDateAndHour) {
  const JSONResponse = await openai.createCompletion({
    model:'text-davinci-003',
    prompt: `You are assigned to assist with Perficient's Microsoft Outlook automation tasks. Your objective revolves around a specific scenario: when provided with an input string "${input}", it is associated with JSON data "${response}". Your role involves gleaning required information from this dataset.

    Specifically, your task involves the filtering of objects present within this JSON array, with a constraint that none of the individual fields within these objects are to be altered or removed. The intactness of each object's structure is of paramount importance. If data elimination is necessitated, the removal should involve the entire object within the array rather than individual fields or their respective values.
    
    Your result should exclusively comprise the filtered JSON data, devoid of any supplementary explanatory data. I just want the JSON, nothing else, pleaso do not give me explanations, I just want the JSON. The reference point for date and time during this task is ${currentDateAndHour}.
    
    The input data structure you are working with - not the actual values, only the structure - is as follows:
    
        [
          {
            attendees: [value],
            end: { dateTime: 'value', timeZone: 'value' },
            start: { dateTime: 'value', timeZone: 'value' },
            subject: 'value',
            web: 'value'
          },
          {
            attendees: [value],
            end: { dateTime: 'value', timeZone: 'value' },
            start: { dateTime: 'value', timeZone: 'value' },
            subject: 'value',
            web: 'value'
          }
        ]
    `,
    max_tokens: 500,
    temperature: 0,
    n: 1,
    stream: false
  });

  console.log('Filtrado:', JSONResponse.data.choices[0].text);

  return JSONResponse.data.choices[0].text;
}

function formatJSONOutResponse(response) {
  let resultString = '';

  // Iterate over each object in the array
  response.forEach(function(obj) {
    // Iterate over each key in the object
    console.log('Objeto:', obj);

    const startDateTime = splitStringByT(obj.start.dateTime);
    const startDate = startDateTime[0];
    const startTime = removeLastEightCharacters(startDateTime[1]);

    const endDateTime = splitStringByT(obj.end.dateFTime);
    const endDate = endDateTime[0];
    const endTime = removeLastEightCharacters(endDateTime[1]);

    resultString += `Subject: <a href="${obj.web}">${obj.subject}</a>
    Start Date: ${startDate} | ${startTime} ${obj.start.timeZone}
    End Date: ${endDate} | ${endTime} ${obj.end.timeZone}
    Attendees: ${obj.attendees}
    ___________________________________________________________________`;
  });

  return resultString;
}

async function scheduleMeetingOutlook(JSONData) {
  let result = '';

  axios.post('http://127.0.0.1:3001/Outlook/ScheduleMeeting', JSONData)
  .then(response => {
    console.log('Response:', response.data);
    result = response.data;
  })
  .catch(error => {
    console.error('Error:', error);
    result = error;
  });

  return result;
}

// Exports
module.exports = {
  outlookClassification,
  scheduleMeetingContinue,
  checksConversationTopic,
  validatesSchedulePast,
  validatesScheduleFuture
};