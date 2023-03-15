import {ChatGPT} from 'chatgpt-official';

const bot = new ChatGPT(process.env.OPENAI_API_TOKEN);

// eslint-disable-next-line rulesdir/no-inline-named-export, import/prefer-default-export, @lwc/lwc/no-async-await
export async function summarize(largeMessage) {
    console.log('Asking ChatGPT:', largeMessage);
    const response = await bot.ask(largeMessage);
    console.log('ChatGPT replied:', response);
    return response;
}
