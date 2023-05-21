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

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`; // Returns the current date and hour in a concatenated string.
  }

  function hasNullValues(obj) {
    if (typeof obj !== 'object') {
      return false;
    }
  
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (obj[key] === null) {
          return true;
        }
  
        if (typeof obj[key] === 'object' && hasNullValues(obj[key])) {
          return true;
        }
      }
    }
  
    return false;
  }

module.exports = {
    port,
    openai,
    getCurrentDateAndHour,
    hasNullValues
};