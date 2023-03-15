// import {ChatGPTAPI} from 'chatgpt';

const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

export async function fetchChatGPTResponse(message) {
    return await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": message}] 
        }),
      });
}

// const api = new ChatGPTAPI({
//     apiKey: OPENAI_API_TOKEN,
// });

// // eslint-disable-next-line rulesdir/no-inline-named-export, import/prefer-default-export, @lwc/lwc/no-async-await
// export async function summarize(largeMessage) {
//     const res = await api.sendMessage(largeMessage);
//     return res;
// }
