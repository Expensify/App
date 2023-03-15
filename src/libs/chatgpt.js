import OpenAI from 'openai-api';

const OPENAI_API_KEY = '';

const openai = new OpenAI(OPENAI_API_KEY);

// eslint-disable-next-line @lwc/lwc/no-async-await
async function complete(prompt) {
    const gptResponse = await openai.complete({
        engine: 'davinci',
        // eslint-disable-next-line es/no-nullish-coalescing-operators
        prompt: prompt ?? 'summarize this:',
        maxTokens: 5,
        temperature: 0.9,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0,
        bestOf: 1,
        n: 1,
        stream: false,
        stop: ['\n', 'testing'],
    });

    return gptResponse;
}

export {complete};
