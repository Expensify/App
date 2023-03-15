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
