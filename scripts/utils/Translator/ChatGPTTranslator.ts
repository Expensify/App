import dedent from '@libs/StringUtils/dedent';
import getBasePrompt from '@prompts/translation/base';
import getContextPrompt from '@prompts/translation/context';
import type {TranslationTargetLanguage} from '@src/CONST/LOCALES';
import OpenAIUtils from '../OpenAIUtils';
import Translator from './Translator';

class ChatGPTTranslator extends Translator {
    /**
     * The maximum number of times we'll retry a successful translation request in the event of hallucinations.
     */
    private static readonly MAX_RETRIES: number = 2;

    /**
     * OpenAI API client to perform translations.
     */
    private readonly openai: OpenAIUtils;

    public constructor(apiKey: string) {
        super();
        this.openai = new OpenAIUtils(apiKey);
    }

    protected async performTranslation(targetLang: TranslationTargetLanguage, text: string, context?: string): Promise<string> {
        const systemPrompt = dedent(`
            ${getBasePrompt(targetLang)}
            ${getContextPrompt(context)}
        `);

        let attempt = 0;
        while (attempt <= ChatGPTTranslator.MAX_RETRIES) {
            try {
                const result = await this.openai.promptChatCompletions({
                    systemPrompt,
                    userPrompt: text,
                });

                if (this.validateTemplatePlaceholders(text, result)) {
                    console.log(`🧠 Translated "${text}" to ${targetLang}: "${result}"`);
                    return result;
                }

                console.warn(`⚠️ Translation for "${text}" failed placeholder validation (attempt ${attempt + 1}/${ChatGPTTranslator.MAX_RETRIES + 1})`);

                if (attempt === ChatGPTTranslator.MAX_RETRIES) {
                    console.error(`❌ Final attempt failed placeholder validation. Falling back to original.`);
                    return text;
                }
            } catch (error) {
                console.error(`Error translating "${text}" to ${targetLang} (attempt ${attempt + 1}):`, error);

                if (attempt === ChatGPTTranslator.MAX_RETRIES) {
                    return text; // Final fallback
                }
            }

            attempt++;
        }

        // Should never hit this, but fallback just in case
        return text;
    }

    /**
     * Validate that placeholders are all present and unchanged before and after translation.
     */
    private validateTemplatePlaceholders(original: string, translated: string): boolean {
        const extractPlaceholders = (s: string) =>
            Array.from(s.matchAll(/\$\{[^}]*}/g))
                .map((m) => m[0])
                .sort();
        const originalSpans = extractPlaceholders(original);
        const translatedSpans = extractPlaceholders(translated);
        return JSON.stringify(originalSpans) === JSON.stringify(translatedSpans);
    }
}

export default ChatGPTTranslator;
