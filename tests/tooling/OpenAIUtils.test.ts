/* eslint-disable @typescript-eslint/naming-convention */
import {beforeEach, describe, expect, it, jest, mock} from 'bun:test';

import * as OpenAIModule from 'openai';

const mockResponsesCreate = jest.fn();
const mockConversationsCreate = jest.fn();
const mockConversationItemsCreate = jest.fn();
const mockConversationItemsList = jest.fn();
const mockConversationItemsDelete = jest.fn();

// Preserve the real APIError class so OpenAIUtils's `error instanceof OpenAI.APIError` retry check still works.
await mock.module('openai', () => ({
    __esModule: true,
    default: Object.assign(
        jest.fn(() => ({
            responses: {create: mockResponsesCreate},
            conversations: {
                create: mockConversationsCreate,
                items: {create: mockConversationItemsCreate, list: mockConversationItemsList, delete: mockConversationItemsDelete},
            },
        })),
        {APIError: OpenAIModule.default.APIError},
    ),
}));

// Imported after the mock.module() call above so it picks up the mock.
const {default: OpenAIUtils} = await import('@scripts/utils/OpenAIUtils');
type OpenAIUtilsInstance = InstanceType<typeof OpenAIUtils>;

describe('OpenAIUtils', () => {
    let openAI: OpenAIUtilsInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        openAI = new OpenAIUtils('test-api-key');
    });

    describe('promptResponses', () => {
        it('returns trimmed output text and response ID, defaulting the model', async () => {
            mockResponsesCreate.mockResolvedValueOnce({output_text: '  hello world  ', id: 'resp_1'});

            const result = await openAI.promptResponses({input: 'hi'});

            expect(result).toEqual({text: 'hello world', responseID: 'resp_1'});
            expect(mockResponsesCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: 'gpt-5.1',
                    input: 'hi',
                }),
            );
        });

        it('forwards conversation, model, promptCacheKey, and textFormat', async () => {
            mockResponsesCreate.mockResolvedValueOnce({output_text: 'ok', id: 'resp_2'});

            const textFormat = {type: 'json_schema' as const, name: 'test_schema', strict: true, schema: {type: 'object', properties: {}}};
            await openAI.promptResponses({
                input: 'hi',
                instructions: 'be nice',
                conversation: 'conv_123',
                model: 'gpt-5.6-luna',
                promptCacheKey: 'test-key',
                textFormat,
            });

            expect(mockResponsesCreate).toHaveBeenCalledWith({
                model: 'gpt-5.6-luna',
                input: 'hi',
                instructions: 'be nice',
                conversation: 'conv_123',
                text: {format: textFormat},
                prompt_cache_key: 'test-key',
                prompt_cache_retention: '24h',
            });
        });

        it('throws when the API returns no output text', async () => {
            mockResponsesCreate.mockResolvedValueOnce({output_text: '   ', id: 'resp_3'});

            await expect(openAI.promptResponses({input: 'hi'})).rejects.toThrow('Error getting response from OpenAI Responses API');
        });

        // Waits out retryWithBackoff's real 1s first delay. Under Jest this advanced the globally-faked
        // timers, but bun:test has no global fake timers and no async timer advance to install, and the
        // second here buys a test that exercises the actual backoff rather than a stubbed one.
        it('retries a retryable error and succeeds on the next attempt', async () => {
            const rateLimitError = new OpenAIModule.default.APIError(429, undefined, 'Rate limited', undefined);
            mockResponsesCreate.mockRejectedValueOnce(rateLimitError).mockResolvedValueOnce({output_text: 'recovered', id: 'resp_4'});

            await expect(openAI.promptResponses({input: 'hi'})).resolves.toEqual({text: 'recovered', responseID: 'resp_4'});
            expect(mockResponsesCreate).toHaveBeenCalledTimes(2);
        }, 10_000);
    });

    describe('createConversation', () => {
        it('creates a conversation without items', async () => {
            mockConversationsCreate.mockResolvedValueOnce({id: 'conv_1', created_at: 0, metadata: null, object: 'conversation'});

            const conversation = await openAI.createConversation();

            expect(conversation.id).toBe('conv_1');
            expect(mockConversationsCreate).toHaveBeenCalledWith(undefined);
        });

        it('creates a conversation seeded with items', async () => {
            mockConversationsCreate.mockResolvedValueOnce({id: 'conv_2', created_at: 0, metadata: null, object: 'conversation'});
            const items = [{role: 'user' as const, content: 'seed'}];

            await openAI.createConversation(items);

            expect(mockConversationsCreate).toHaveBeenCalledWith({items});
        });
    });

    describe('addConversationItems', () => {
        it('adds items to an existing conversation', async () => {
            mockConversationItemsCreate.mockResolvedValueOnce({data: [], object: 'list'});
            const items = [{role: 'user' as const, content: 'more context'}];

            await openAI.addConversationItems('conv_1', items);

            expect(mockConversationItemsCreate).toHaveBeenCalledWith('conv_1', {items});
        });
    });

    describe('listConversationItems', () => {
        it('follows pagination and returns every item in order', async () => {
            // The real client returns an async iterable that pages transparently, so the whole point of the
            // method is that callers get one flat array rather than a first page.
            mockConversationItemsList.mockReturnValueOnce({
                async *[Symbol.asyncIterator]() {
                    yield {id: 'item_1'};
                    yield {id: 'item_2'};
                    yield {id: 'item_3'};
                },
            });

            const items = await openAI.listConversationItems('conv_1');

            expect(items.map((item) => item.id)).toEqual(['item_1', 'item_2', 'item_3']);
            expect(mockConversationItemsList).toHaveBeenCalledWith('conv_1');
        });

        it('returns an empty array for a conversation with no items', async () => {
            mockConversationItemsList.mockReturnValueOnce({
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                async *[Symbol.asyncIterator]() {},
            });

            await expect(openAI.listConversationItems('conv_1')).resolves.toEqual([]);
        });
    });

    describe('deleteConversationItem', () => {
        it('passes the item ID first and the conversation as an option, matching the API signature', async () => {
            // This is the only method that destroys data, and the argument order is the easy thing to get
            // backwards: swapping them would delete nothing and fail silently.
            mockConversationItemsDelete.mockResolvedValueOnce({});

            await openAI.deleteConversationItem('conv_1', 'item_1');

            expect(mockConversationItemsDelete).toHaveBeenCalledWith('item_1', {conversation_id: 'conv_1'});
        });

        it('surfaces a failed delete rather than swallowing it', async () => {
            mockConversationItemsDelete.mockRejectedValueOnce(new Error('item not found'));

            await expect(openAI.deleteConversationItem('conv_1', 'item_1')).rejects.toThrow('item not found');
        });
    });

    describe('parseJSONResponse', () => {
        type TestShape = {foo: string};
        const isTestShape = (value: unknown): value is TestShape => {
            if (typeof value !== 'object' || value === null) {
                return false;
            }
            const {foo} = value as Partial<TestShape>;
            return typeof foo === 'string';
        };

        it('parses and validates a well-formed JSON response', () => {
            expect(openAI.parseJSONResponse('{"foo":"bar"}', isTestShape)).toEqual({foo: 'bar'});
        });

        it('returns null for malformed JSON instead of throwing', () => {
            expect(openAI.parseJSONResponse('not json', isTestShape)).toBeNull();
        });

        it('returns null when the parsed JSON does not match the expected shape', () => {
            expect(openAI.parseJSONResponse('{"bar":"baz"}', isTestShape)).toBeNull();
        });
    });
});
