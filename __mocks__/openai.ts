const mockCreate = jest.fn(({messages}) => {
    const text = messages?.find((m) => m.role === 'user')?.content ?? '';
    return Promise.resolve({
        choices: [
            {
                message: {
                    content: `[ChatGPT] ${text}`,
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
