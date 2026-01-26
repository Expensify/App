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
    const maxRetries = 4;
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
        expect(MockedOpenAIUtils.prototype.promptResponses).toHaveBeenCalledTimes(maxRetries + 1);
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

    it('tracks failed translations after exhausting all retries', async () => {
        // Always throw an error
        const testError = new Error('Test API error');
        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockRejectedValue(testError);

        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);

        const failures = translator.getFailedTranslations();
        expect(failures).toHaveLength(1);
        expect(failures.at(0)).toMatchObject({
            text: original,
            targetLang,
            error: 'Test API error',
        });
    });

    it('returns empty array when no translations have failed', async () => {
        (MockedOpenAIUtils.prototype.promptResponses as jest.Mock).mockResolvedValue(mockResponse(validTranslation));

        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);

        const failures = translator.getFailedTranslations();
        expect(failures).toHaveLength(0);
    });
});
