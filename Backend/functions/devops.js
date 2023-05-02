var express = require('express');
var router = express.Router();
const axios = require('axios');
const Tesseract = require('tesseract.js');

require("dotenv").config();

/* GET home page. */
router.get('/devops', function(req, res, next) {
  res.render('devops', { title: 'Express' });
});

router.post('/devops', function(req, res, next) {
  Tesseract.recognize(
    '../public/images/cvimg.jpeg',
    'eng',
    {logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log(text);

    // Define the input text for ChatGPT with the extracted text from Tesseract
    const inputText = `Give me a summary of the profile of this person based on the following information available about their CV. ${text}` +" It should not be longer that a paragraph or two at best, you should resume it like i am a recruiter and i want to know if this person is worth my time to interview. Also, the first thing i want to know is the years of experience he has, following with his areas of expertise and finally his education.";

    // Define the API endpoint and parameters
    const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    const maxTokens = 150;
    const apiKey = process.env.OPENAI_API_KEY; // Replace with your actual API key

    // Define the API headers
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Define the API payload
    const data = {
      prompt: inputText,
      max_tokens: maxTokens
    };

    // Send API request
    axios.post(apiUrl, data, { headers: headers })
        .then(response => {
          // Extract and display the generated summary
          const summary = response.data.choices[0].text;
          console.log('Generated Summary:', summary);
          res.send({ response: summary });
        })
        .catch(error => {
          console.error('API Request Failed:', error);
        });
    });
});

module.exports = router;