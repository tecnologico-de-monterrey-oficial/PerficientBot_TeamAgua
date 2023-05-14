export async function outlookDecision(input) {
    const response = await openai.createCompletion({
        model:'text-davinci-003',
        prompt: `Imagine that you are a chatbot for a company called Perficient, which is capable of automating workflow-related tasks with Outlook. Given this sentence "${input}". According to the main action of the sentence (if necessary, only focus in the main action, imagine where the action will take place considering the best platform to have it), determine which of the following options it belongs to: 

        1.- Get all scheduled events starting today.
        2.- Get all scheduled events starting today, but up to the following 7 days. 
        3.- Get all scheduled events starting today, but up to the following 31 days.
        4.- Schedule a meeting.
            
        Remember, there are only these 4 options, there are no others available. Just answer with the number of the option, without the period.
        Answer format: "[number]"
        Example: "2"
        
        In such case that none of the options are related to the sentence, write "I am sorry, can you rephrase your query?".`,
        max_tokens: 150,
        temperature: 0,
        n: 1,
        stream: false
      });
    
    //   return decisionClassification(parseInt(response.data.choices[0].text), input);
}