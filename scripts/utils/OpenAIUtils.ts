import OpenAI from 'openai';
import type {ChatCompletionMessageParam, ChatModel} from 'openai/resources';
import type {MessageContent, TextContentBlock} from 'openai/resources/beta/threads';
import type {AssistantResponse} from '@github/actions/javascript/proposalPoliceComment/proposalPoliceComment';
import sanitizeJSONStringValues from '@github/libs/sanitizeJSONStringValues';
import retryWithBackoff from '@scripts/utils/retryWithBackoff';

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
     * The role of the `user` in the OpenAI model.
     */
    private static readonly USER = 'user';

    /**
     * The role of the `assistant` in the OpenAI model.
     */
    private static readonly ASSISTANT = 'assistant';

    /**
     * The status of a completed run in the OpenAI model.
     */
    private static readonly OPENAI_RUN_COMPLETED = 'completed';

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
    public async promptChatCompletions({userPrompt, systemPrompt = '', model = 'gpt-5.1'}: {userPrompt: string; systemPrompt?: string; model?: ChatModel}): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [{role: 'user', content: userPrompt}];
        if (systemPrompt) {
            messages.unshift({role: 'system', content: systemPrompt});
        }

        const response = await retryWithBackoff(
            () =>
                this.client.chat.completions.create({
                    model,
                    messages,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    reasoning_effort: 'low',
                }),
            {isRetryable: (err) => OpenAIUtils.isRetryableError(err)},
        );

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
        // 1. Create a thread
        const thread = await retryWithBackoff(
            () =>
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                this.client.beta.threads.create({
                    messages: [{role: OpenAIUtils.USER, content: userMessage}],
                }),
            {isRetryable: (err) => OpenAIUtils.isRetryableError(err)},
        );

        // 2. Create a run on the thread
        let run = await retryWithBackoff(
            () =>
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                this.client.beta.threads.runs.create(thread.id, {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    assistant_id: assistantID,
                }),
            {isRetryable: (err) => OpenAIUtils.isRetryableError(err)},
        );

        // 3. Poll for completion
        let response = '';
        let count = 0;
        while (!response && count < OpenAIUtils.MAX_POLL_COUNT) {
            // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-deprecated
            run = await this.client.beta.threads.runs.retrieve(run.id, {thread_id: thread.id});
            if (run.status !== OpenAIUtils.OPENAI_RUN_COMPLETED) {
                count++;
                await new Promise((resolve) => {
                    setTimeout(resolve, OpenAIUtils.POLL_RATE);
                });
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-deprecated
            for await (const message of this.client.beta.threads.messages.list(thread.id)) {
                if (message.role !== OpenAIUtils.ASSISTANT) {
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

    private static isRetryableError(error: unknown): boolean {
        // Handle known/predictable API errors
        if (error instanceof OpenAI.APIError) {
            // Only retry 429 (rate limit) or 5xx errors
            const status = error.status as number;
            return !!status && (status === 429 || status >= 500);
        }

        // Handle random/unpredictable network errors
        if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            return (
                msg.includes('timeout') ||
                msg.includes('socket hang up') ||
                msg.includes('fetch failed') ||
                msg.includes('network error') ||
                msg.includes('connection reset') ||
                msg.includes('connection aborted') ||
                msg.includes('ecconnrefused') || // Node-fetch errors
                msg.includes('dns') ||
                msg.includes('econn') ||
                msg.includes('request to') // node-fetch errors often include this
            );
        }

        return false;
    }

    public parseAssistantResponse<T extends AssistantResponse>(response: string): T | null {
        const sanitized = sanitizeJSONStringValues(response);
        let parsed: T;

        try {
            parsed = JSON.parse(sanitized) as T;
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', response);
            return null;
        }

        if (typeof parsed !== 'object' || typeof parsed.action !== 'string' || typeof parsed.message !== 'string') {
            console.error('AI response missing required fields:', parsed);
            return null;
        }

        return parsed;
    }
}

export default OpenAIUtils;
