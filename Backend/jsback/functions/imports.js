const { Configuration, OpenAIApi } = require("openai");

// .env configuration
require("dotenv").config({ path: '../../.env' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const port = process.env.PORT;
const openai = new OpenAIApi(configuration);

  // Function that gets the current date and hour.
  function getCurrentDateAndHour() {
    // Create a new Date object
    const currentDate = new Date();

    // Get the current date
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Get the current hour
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Print the current date and hour
    console.log(`Current date: ${year}-${month}-${day}`);
    console.log(`Current time: ${hours}:${minutes}:${seconds}`);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.099Z`; // Returns the current date and hour in a concatenated string.
  }

  function hasNullValues(jsonObj) {
    for (let key in jsonObj) {
      if (jsonObj[key] === null) {
        return true;
      }
    }
    return false;
  }

  function mergeJSONObjects(json1, json2) {
    const mergedJSON = { ...json1 };
  
    for (const key in json2) {
      if (json2.hasOwnProperty(key)) {
        const value1 = json1[key];
        const value2 = json2[key];
  
        if (value2 !== null) {
          if (value1 === null || value1 === undefined) {
            mergedJSON[key] = value2;
          } else if (typeof value1 === 'object' && typeof value2 === 'object') {
            mergedJSON[key] = mergeJSON(value1, value2);
          }
        }
      }
    }
  
    return mergedJSON;
  }

module.exports = {
    port,
    openai,
    getCurrentDateAndHour,
    hasNullValues,
    mergeJSONObjects
};