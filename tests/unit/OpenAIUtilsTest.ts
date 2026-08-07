/* eslint-disable @typescript-eslint/naming-convention */
/**
 * @jest-environment node
 */
import OpenAIUtils from '@scripts/utils/OpenAIUtils';

import type * as OpenAIModule from 'openai';

const mockResponsesCreate = jest.fn();
const mockConversationsCreate = jest.fn();
const mockConversationItemsCreate = jest.fn();

jest.mock('openai', () => {
    const actual = jest.requireActual<typeof OpenAIModule>('openai');
    return {
        __esModule: true,
        // Preserve the real APIError class so OpenAIUtils's `error instanceof OpenAI.APIError` retry check still works.
        default: Object.assign(
            jest.fn().mockImplementation(() => ({
                responses: {create: mockResponsesCreate},
                conversations: {create: mockConversationsCreate, items: {create: mockConversationItemsCreate}},
            })),
            {APIError: actual.default.APIError},
        ),
    };
});

describe('OpenAIUtils', () => {
    let openAI: OpenAIUtils;

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

        it('retries a retryable error and succeeds on the next attempt', async () => {
            const actual = jest.requireActual<typeof OpenAIModule>('openai');
            const rateLimitError = new actual.default.APIError(429, undefined, 'Rate limited', undefined);
            mockResponsesCreate.mockRejectedValueOnce(rateLimitError).mockResolvedValueOnce({output_text: 'recovered', id: 'resp_4'});

            const promise = openAI.promptResponses({input: 'hi'});
            await jest.advanceTimersByTimeAsync(1000);

            await expect(promise).resolves.toEqual({text: 'recovered', responseID: 'resp_4'});
            expect(mockResponsesCreate).toHaveBeenCalledTimes(2);
        });
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
