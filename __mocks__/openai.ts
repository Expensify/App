import type {ChatCompletionCreateParamsNonStreaming} from 'openai/resources/chat/completions';

const mockCreate = jest.fn(({messages}: ChatCompletionCreateParamsNonStreaming) => {
    const text = messages?.find((m) => m.role === 'user')?.content ?? '';
    return Promise.resolve({
        choices: [
            {
                message: {
                    content: `[ChatGPT] ${text as string}`,
                },
            },
        ],
    });
});

class MockOpenAI {
    chat = {
        completions: {
            create: mockCreate,
        },
    };
}

export default MockOpenAI;
