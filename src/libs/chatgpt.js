import {ChatGPTAPI} from 'chatgpt';

const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

const api = new ChatGPTAPI({
    apiKey: OPENAI_API_TOKEN,
});

// eslint-disable-next-line rulesdir/no-inline-named-export, import/prefer-default-export, @lwc/lwc/no-async-await
export async function summarize(largeMessage) {
    const res = await api.sendMessage(largeMessage);
    return res;
}
