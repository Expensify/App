/**
 * @jest-environment node
 */
import OpenAIUtils from '@scripts/utils/OpenAIUtils';
import ChatGPTTranslator from '@scripts/utils/Translator/ChatGPTTranslator';
import type Locale from '@src/types/onyx/Locale';

jest.mock('@scripts/utils/OpenAIUtils');

const MockedOpenAIUtils = OpenAIUtils as jest.MockedClass<typeof OpenAIUtils>;

/**
 * Creates a mock response for promptResponses
 */
function mockResponse(text: string, responseID = 'resp_test_123') {
    return {text, responseID};
}

describe('ChatGPTTranslator.performTranslation', () => {
    const apiKey = 'test-api-key';
    const targetLang: Locale = 'it' as Locale;
    // eslint-disable-next-line no-template-curly-in-string
    const original = 'Hello ${name}!';
    // eslint-disable-next-line no-template-curly-in-string
    const validTranslation = '[it] Hello ${name}!';
    const invalidTranslation = '[it] Hello name!'; // missing ${...}

    const originalHTML = '<img src="photo.jpg" alt="A dog" class="photo">';
    const validHTMLTranslation = '[it] <img src="photo.jpg" alt="Un chien" class="photo">';
    const invalidHTMLTranslation = '[it] <img src="different.jpg" alt="Un chien" class="photo">'; // different src

    let translator: ChatGPTTranslator;

    beforeEach(() => {
        jest.clearAllMocks();
        MockedOpenAIUtils.prototype.createConversation = jest.fn().mockResolvedValue('conv_test_123');
        MockedOpenAIUtils.prototype.promptResponses = jest.fn();
        translator = new ChatGPTTranslator(apiKey);
    });

    it('retries if translated template has incorrect placeholders, then succeeds', async () => {
        // First attempt returns invalid placeholder format, second returns valid
        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockResolvedValueOnce(mockResponse(invalidTranslation)).mockResolvedValueOnce(mockResponse(validTranslation));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, original);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(2);
        expect(result).toBe(validTranslation);
    });

    it('returns original string after exceeding retry attempts', async () => {
        // Always returns invalid
        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockResolvedValue(mockResponse(invalidTranslation));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, original);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(ChatGPTTranslator.MAX_RETRIES + 1);
        expect(result).toBe(original);
    });

    it('retries if translated HTML has incorrect attributes, then succeeds', async () => {
        // First attempt returns invalid HTML format, second returns valid
        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockResolvedValueOnce(mockResponse(invalidHTMLTranslation)).mockResolvedValueOnce(mockResponse(validHTMLTranslation));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, originalHTML);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(2);
        expect(result).toBe(validHTMLTranslation);
    });

    it('fixes Chinese brackets in markdown syntax after translation', async () => {
        const originalText = '[Click here](https://example.com)';
        const translatedWithChineseBrackets = '【点击这里】(https://example.com)';
        const expectedFixed = '[点击这里](https://example.com)';

        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockResolvedValueOnce(mockResponse(translatedWithChineseBrackets));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, originalText);

        expect(result).toBe(expectedFixed);
    });

    it('creates a conversation once per locale and reuses it', async () => {
        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockResolvedValue(mockResponse(validTranslation));

        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);
        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);

        // createConversation should only be called once for the same locale
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.createConversation).toHaveBeenCalledTimes(1);

        // promptResponses should be called twice
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(2);
    });

    it('passes conversation ID and previous response ID to promptResponses', async () => {
        const firstResponseID = 'resp_first_123';
        const secondResponseID = 'resp_second_456';

        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock)
            .mockResolvedValueOnce(mockResponse(validTranslation, firstResponseID))
            .mockResolvedValueOnce(mockResponse(validTranslation, secondResponseID));

        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);
        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);

        const calls = (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mock.calls;

        // First call should have no previousResponseID
        expect(calls[0][0].conversationID).toBe('conv_test_123');
        expect(calls[0][0].previousResponseID).toBeUndefined();

        // Second call should have the previous response ID from first successful call
        expect(calls[1][0].conversationID).toBe('conv_test_123');
        expect(calls[1][0].previousResponseID).toBe(firstResponseID);
    });
});
