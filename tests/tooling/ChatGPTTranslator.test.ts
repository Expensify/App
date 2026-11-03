import {beforeEach, describe, expect, it, jest} from 'bun:test';

import OpenAIUtils from '@scripts/utils/OpenAIUtils';
import ChatGPTTranslator from '@scripts/utils/Translator/ChatGPTTranslator';

import type {TranslationTargetLocale} from '@src/CONST/LOCALES';

// Only `promptResponses` needs stubbing: the OpenAIUtils constructor just stores the key and builds a client, so
// there is nothing to gain from replacing the whole module (which Bun has no automock for anyway).
const mockedPromptResponses = jest.spyOn(OpenAIUtils.prototype, 'promptResponses');

/**
 * Creates a mock response for promptResponses
 */
function mockResponse(text: string, responseID = 'resp_test_123') {
    return {text, responseID};
}

describe('ChatGPTTranslator.performTranslation', () => {
    const apiKey = 'test-api-key';
    const targetLang: TranslationTargetLocale = 'it';
    const maxRetries = 8;
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
        mockedPromptResponses.mockReset();
        translator = new ChatGPTTranslator(apiKey);
    });

    it('retries if translated template has incorrect placeholders, then succeeds', async () => {
        // First attempt returns invalid placeholder format, second returns valid
        mockedPromptResponses.mockResolvedValueOnce(mockResponse(invalidTranslation)).mockResolvedValueOnce(mockResponse(validTranslation));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, original);

        expect(mockedPromptResponses).toHaveBeenCalledTimes(2);
        expect(result).toBe(validTranslation);
    });

    it('returns original string after exceeding retry attempts', async () => {
        // Always returns invalid
        mockedPromptResponses.mockResolvedValue(mockResponse(invalidTranslation));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, original);

        expect(mockedPromptResponses).toHaveBeenCalledTimes(maxRetries + 1);
        expect(result).toBe(original);
    });

    it('retries if translated HTML has incorrect attributes, then succeeds', async () => {
        // First attempt returns invalid HTML format, second returns valid
        mockedPromptResponses.mockResolvedValueOnce(mockResponse(invalidHTMLTranslation)).mockResolvedValueOnce(mockResponse(validHTMLTranslation));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, originalHTML);

        expect(mockedPromptResponses).toHaveBeenCalledTimes(2);
        expect(result).toBe(validHTMLTranslation);
    });

    it('fixes Chinese brackets in markdown syntax after translation', async () => {
        const originalText = '[Click here](https://example.com)';
        const translatedWithChineseBrackets = '【点击这里】(https://example.com)';
        const expectedFixed = '[点击这里](https://example.com)';

        mockedPromptResponses.mockResolvedValueOnce(mockResponse(translatedWithChineseBrackets));

        // @ts-expect-error TS2445
        const result = await translator.performTranslation(targetLang, originalText);

        expect(result).toBe(expectedFixed);
    });

    it('tracks failed translations after exhausting all retries', async () => {
        // Always throw an error
        const testError = new Error('Test API error');
        mockedPromptResponses.mockRejectedValue(testError);

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
        mockedPromptResponses.mockResolvedValue(mockResponse(validTranslation));

        // @ts-expect-error TS2445
        await translator.performTranslation(targetLang, original);

        const failures = translator.getFailedTranslations();
        expect(failures).toHaveLength(0);
    });
});
