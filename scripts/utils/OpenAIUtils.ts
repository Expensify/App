import OpenAI from 'openai';
import type {ChatCompletionCreateParams, ChatCompletionMessageParam, ChatModel} from 'openai/resources';
import type {AssistantResponse} from '@github/actions/javascript/proposalPoliceComment/proposalPoliceComment';
import sanitizeJSONStringValues from '@github/libs/sanitizeJSONStringValues';
import retryWithBackoff from '@scripts/utils/retryWithBackoff';

class OpenAIUtils {
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
    public async promptChatCompletions({
        userPrompt,
        systemPrompt = '',
        model = 'gpt-5',
        responseFormat,
    }: {
        userPrompt: string;
        systemPrompt?: string;
        model?: ChatModel;
        responseFormat?: ChatCompletionCreateParams['response_format'];
    }): Promise<string> {
        const messages: ChatCompletionMessageParam[] = [{role: 'user', content: userPrompt}];
        if (systemPrompt) {
            messages.unshift({role: 'system', content: systemPrompt});
        }

        const response = await retryWithBackoff(
            () =>
                this.client.chat.completions.create({
                    model,
                    messages,
                    ...(responseFormat ? {response_format: responseFormat} : {}),
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
