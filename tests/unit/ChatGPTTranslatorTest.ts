/**
 * @jest-environment node
 */
import OpenAIUtils from '@scripts/utils/OpenAIUtils';
import ChatGPTTranslator from '@scripts/utils/Translator/ChatGPTTranslator';
import type Locale from '@src/types/onyx/Locale';

jest.mock('@scripts/utils/OpenAIUtils');

const MockedOpenAIUtils = OpenAIUtils as jest.MockedClass<typeof OpenAIUtils>;

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
        MockedOpenAIUtils.prototype.promptChatCompletions = jest.fn();
        translator = new ChatGPTTranslator(apiKey);
    });

    it('retries if translated template has incorrect placeholders, then succeeds', async () => {
        // First attempt returns invalid placeholder format, second returns valid
        (MockedOpenAIUtils.prototype.promptChatCompletions as jest.Mock).mockResolvedValueOnce(invalidTranslation).mockResolvedValueOnce(validTranslation);

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, original);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptChatCompletions).toHaveBeenCalledTimes(2);
        expect(result).toBe(validTranslation);
    });

    it('returns original string after exceeding retry attempts', async () => {
        // Always returns invalid
        (MockedOpenAIUtils.prototype.promptChatCompletions as jest.Mock).mockResolvedValue(invalidTranslation);

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, original);

        // @ts-expect-error TS2341
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptChatCompletions).toHaveBeenCalledTimes(ChatGPTTranslator.MAX_RETRIES + 1);
        expect(result).toBe(original);
    });

    it('retries if translated HTML has incorrect attributes, then succeeds', async () => {
        // First attempt returns invalid HTML format, second returns valid
        (MockedOpenAIUtils.prototype.promptChatCompletions as jest.Mock).mockResolvedValueOnce(invalidHTMLTranslation).mockResolvedValueOnce(validHTMLTranslation);

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, originalHTML);

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(MockedOpenAIUtils.prototype.promptChatCompletions).toHaveBeenCalledTimes(2);
        expect(result).toBe(validHTMLTranslation);
    });

    it('fixes Chinese brackets in markdown syntax after translation', async () => {
        const originalText = '[Click here](https://example.com)';
        const translatedWithChineseBrackets = '【点击这里】(https://example.com)';
        const expectedFixed = '[点击这里](https://example.com)';

        (MockedOpenAIUtils.prototype.promptChatCompletions as jest.Mock).mockResolvedValueOnce(translatedWithChineseBrackets);

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, originalText);

        expect(result).toBe(expectedFixed);
    });
});
