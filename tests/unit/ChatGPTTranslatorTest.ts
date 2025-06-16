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
});
