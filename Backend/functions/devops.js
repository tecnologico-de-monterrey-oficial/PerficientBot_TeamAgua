
//OpenAiApi Call
const prompt = "Following this code as a reference, return the value of $TaskValue and $Value that the text at the end would subtitute when making an api call to azure dev ops to create a new work item (tasktype in this case). The Return String should be in the format of: [\"End-to-End Testing\", \"Task\"]\n" +
    "\n" +
    "Return only the values as a js array.\n" +
    "\n" +
    "const devOpsApiUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${Tasktype}?api-version=7.0`;\n" +
    "\n" +
    "const createTask = async () => {\n" +
    "  const requestBody = [\n" +
    "    {\n" +
    "      \"op\": \"add\",\n" +
    "      \"path\": \"/fields/System.Title\",\n" +
    "      \"from\": null,\n" +
    "      \"value\": \"${value}\"\n" +
    "    }\n" +
    "  ];\n" +
    "\n" +
    "The text is: Create a Task Called HolaTest"; //Replace with your prompt
const model = "text-davinci-003";
const apiKey = "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"; // replace with your API key

const ChatGPTapiUrl = "https://api.openai.com/v1/engines/" + model + "/completions";

const generateText = async () => {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };

  const data = {
    "prompt": prompt,
    "max_tokens": 100,
    "temperature": 0.7,
  };

  try {
    const response = await axios.post(ChatGPTapiUrl, data, { headers });
    const generatedText = response.data.choices[0].text;
    console.log("Generated text:", response.data.choices[0].text);
    return generatedText;
  } catch (error) {
    console.error("Error generating text:", error.message);
  }
};

const createTask = async () => {
  const requestBody = [
    {
      "op": "add",
      "path": "/fields/System.Title",
      "from": null,
      "value": `${value}` //El error esta que value queda vacío
    }
  ];

  const headers = {
    "Content-Type": "application/json-patch+json",
    "Authorization": `Basic ${Buffer.from(`:${personalAccessToken}`).toString('base64')}`
  };

  try {
    const response = await axios.post(devOpsApiUrl, requestBody, { headers });
    console.log("Azure DevOps response:", response.data);
  } catch (error) {
    console.error("Error creating task:", error.message);
    console.error("Error details:", error.response.data);
  }
};


//Microsoft Azure DevOps Connection
const organization = "EquipoAgua";
const project = "Agua";
const personalAccessToken = "rgnqhlh3yzzd4era2gm2boznzlfkz3ikhy5wypelannskeljyuyq"; // replace with your PAT

generateText().then(async (generatedText) => {
  const OpenAIResult = JSON.parse(generatedText);
  global.value = OpenAIResult[0]; //Se puede hacer global
  const taskType = OpenAIResult[1];
  console.log("Parsed values:", value, taskType);
  console.log("Tasktype:", taskType);
  console.log("value:", value);
  global.devOpsApiUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${taskType}?api-version=7.0`;
  console.log("Apiurl:", devOpsApiUrl);
  await createTask();
}).catch((error) => {
  console.error("Error generating text:", error.message);
});


//const devOpsApiUrl = `https://dev.azure.com/${organization}/${project}/_apis/wit/workitems/$${Tasktype}?api-version=7.0`;
//console.log("Apiurl:", devOpsApiUrl);



//createTask().then(r => console.log(r));
