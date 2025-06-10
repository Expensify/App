import OpenAI from 'openai';
import type {ChatCompletionMessageParam} from 'openai/resources';
import type {MessageContent, TextContentBlock} from 'openai/resources/beta/threads';

class OpenAIUtils {
    /**
     * How frequently to poll a thread to wait for it to be done.
     */
    private static readonly POLL_RATE = 1500;

    /**
     * The maximum amount of time to wait for a thread to produce a response.
     */
    private static readonly POLL_TIMEOUT = 90000;

    /**
     * The maximum number of requests to make when polling for thread completion.
     */
    private static readonly MAX_POLL_COUNT = Math.floor(OpenAIUtils.POLL_TIMEOUT / OpenAIUtils.POLL_RATE);

    /**
     * OpenAI API client.
     */
    private client: OpenAI;

    public constructor(apiKey: string) {
        this.client = new OpenAI({apiKey});
    }

    /**
     * Prompt the Chat Completions API.
     */
    public async promptChatCompletions({userPrompt, systemPrompt = '', model = 'gpt-4o'}: {userPrompt: string; systemPrompt?: string; model?: string}): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [{role: 'user', content: userPrompt}];
        if (systemPrompt) {
            messages.unshift({role: 'system', content: systemPrompt});
        }

        const response = await this.client.chat.completions.create({
            model,
            messages,
            temperature: 0.3,
        });

        const result = response.choices.at(0)?.message?.content?.trim();
        if (!result) {
            throw new Error('Error getting chat completion response from OpenAI');
        }
        return result;
    }

    /**
     * Prompt a pre-defined assistant.
     */
    public async promptAssistant(assistantID: string, userMessage: string): Promise<string> {
        // start a thread run
        let threadRun = await this.client.beta.threads.createAndRun({
            /* eslint-disable @typescript-eslint/naming-convention */
            assistant_id: assistantID,
            thread: {
                messages: [{role: 'user', content: userMessage}],
            },
        });

        // poll for completion
        let response = '';
        let count = 0;
        while (!response && count < OpenAIUtils.MAX_POLL_COUNT) {
            // await thread run completion
            threadRun = await this.client.beta.threads.runs.retrieve(threadRun.thread_id, threadRun.id);
            if (threadRun.status !== 'completed') {
                count++;
                await new Promise((resolve) => {
                    setTimeout(resolve, OpenAIUtils.POLL_RATE);
                });
                continue;
            }

            for await (const message of this.client.beta.threads.messages.list(threadRun.thread_id)) {
                if (message.role !== 'assistant') {
                    continue;
                }
                response += message.content
                    .map((contentBlock) => OpenAIUtils.isTextContentBlock(contentBlock) && contentBlock.text.value)
                    .join('\n')
                    .trim();
                console.log('Parsed assistant response:', response);
            }
            if (!response) {
                throw new Error('Assistant response is empty or had no text content. This is unexpected.');
            }
        }
        return response;
    }

    private static isTextContentBlock(block: MessageContent): block is TextContentBlock {
        return block.type === 'text';
    }
}

export default OpenAIUtils;
