import sanitizeJSONStringValues from '@github/libs/sanitizeJSONStringValues';

import retryWithBackoff from '@scripts/utils/retryWithBackoff';

import type {Conversation} from 'openai/resources/conversations/conversations';
import type {ConversationItem} from 'openai/resources/conversations/items';
import type {ResponseCreateParamsNonStreaming, ResponseFormatTextJSONSchemaConfig, ResponseInputItem} from 'openai/resources/responses/responses';

import OpenAI from 'openai';

type ResponsesModel = ResponseCreateParamsNonStreaming['model'];

/**
 * Result from creating a response via the Responses API.
 */
type ResponseResult = {
    text: string;
    responseID: string;
};

class OpenAIUtils {
    /**
     * OpenAI API client.
     */
    private client: OpenAI;

    public constructor(apiKey: string) {
        this.client = new OpenAI({apiKey});
    }

    /**
     * Prompt the Responses API with optional prompt caching and/or a persistent conversation.
     */
    public async promptResponses({
        input,
        instructions,
        promptCacheKey,
        model = 'gpt-5.1',
        conversation,
        textFormat,
    }: {
        input: string;
        instructions?: string;
        promptCacheKey?: string;
        model?: ResponsesModel;
        conversation?: string;
        textFormat?: ResponseFormatTextJSONSchemaConfig;
    }): Promise<ResponseResult> {
        const response = await retryWithBackoff(
            () =>
                this.client.responses.create({
                    model,
                    input,
                    instructions,
                    conversation,
                    ...(textFormat ? {text: {format: textFormat}} : {}),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    prompt_cache_key: promptCacheKey,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    prompt_cache_retention: '24h',
                }),
            {isRetryable: (err) => OpenAIUtils.isRetryableError(err)},
        );

        const result = response.output_text?.trim();
        if (!result) {
            throw new Error('Error getting response from OpenAI Responses API');
        }
        return {
            text: result,
            responseID: response.id,
        };
    }

    /**
     * Create a Conversation, optionally seeded with up to 20 initial items.
     */
    public async createConversation(items?: ResponseInputItem[]): Promise<Conversation> {
        return retryWithBackoff(() => this.client.conversations.create(items ? {items} : undefined), {isRetryable: (err) => OpenAIUtils.isRetryableError(err)});
    }

    /**
     * Add up to 20 items at a time to an existing Conversation.
     */
    public async addConversationItems(conversationID: string, items: ResponseInputItem[]): Promise<void> {
        await retryWithBackoff(() => this.client.conversations.items.create(conversationID, {items}), {isRetryable: (err) => OpenAIUtils.isRetryableError(err)});
    }

    /**
     * Every item in a Conversation, following pagination.
     */
    public async listConversationItems(conversationID: string): Promise<ConversationItem[]> {
        return retryWithBackoff(
            async () => {
                const items: ConversationItem[] = [];
                for await (const item of this.client.conversations.items.list(conversationID)) {
                    items.push(item);
                }
                return items;
            },
            {isRetryable: (err) => OpenAIUtils.isRetryableError(err)},
        );
    }

    /**
     * Remove a single item from a Conversation.
     */
    public async deleteConversationItem(conversationID: string, itemID: string): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/naming-convention -- matches OpenAI's API field name
        await retryWithBackoff(() => this.client.conversations.items.delete(itemID, {conversation_id: conversationID}), {isRetryable: (err) => OpenAIUtils.isRetryableError(err)});
    }

    private static isRetryableError(error: unknown): boolean {
        // Handle known/predictable API errors
        if (error instanceof OpenAI.APIError) {
            const status = error.status as number;

            // Retry 429 (rate limit) or 5xx errors
            if (status === 429 || status >= 500) {
                return true;
            }

            // Retry conversation_locked errors (another process is still operating on this conversation)
            // This can happen when a previous request is still being processed by OpenAI
            if ('code' in error && error.code === 'conversation_locked') {
                return true;
            }

            return false;
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

    /**
     * Parse a JSON response from the model, validating its shape with the given type guard.
     */
    public parseJSONResponse<T>(response: string, isValid: (value: unknown) => value is T): T | null {
        let parsed: unknown;
        try {
            const sanitized = sanitizeJSONStringValues(response);
            parsed = JSON.parse(sanitized);
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', response);
            return null;
        }

        if (!isValid(parsed)) {
            console.error('AI response missing required fields:', parsed);
            return null;
        }

        return parsed;
    }
}

export default OpenAIUtils;
