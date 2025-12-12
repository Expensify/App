import getBasePrompt from '@prompts/translation/base';
import getContextPrompt from '@prompts/translation/context';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import OpenAIUtils from '../OpenAIUtils';
import Translator from './Translator';

/**
 * Gets a locale-specific prompt if one exists for the target language.
 */
async function getLocaleSpecificPrompt(targetLang: TranslationTargetLocale): Promise<string> {
    try {
        const localePrompt = await import(`@prompts/translation/${targetLang}`);
        return localePrompt.default || '';
    } catch {
        return '';
    }
}

class ChatGPTTranslator extends Translator {
    /**
     * The maximum number of times we'll retry a successful translation request in the event of hallucinations.
     */
    private static readonly MAX_RETRIES: number = 4;

    /**
     * OpenAI API client to perform translations.
     */
    private readonly openai: OpenAIUtils;

    public constructor(apiKey: string) {
        super();
        this.openai = new OpenAIUtils(apiKey);
    }

    protected async performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
        let systemPrompt = '<system_prompt>\n';
        systemPrompt += '<base_prompt>\n';
        systemPrompt += getBasePrompt(targetLang);
        systemPrompt += '\n</base_prompt>';

        const localeSpecificPrompt = await getLocaleSpecificPrompt(targetLang);
        if (localeSpecificPrompt) {
            systemPrompt += '\n\n<locale_specific_prompt language="' + targetLang + '">\n';
            systemPrompt += localeSpecificPrompt;
            systemPrompt += '\n</locale_specific_prompt>';
        }

        const contextPrompt = getContextPrompt(context);
        if (contextPrompt) {
            systemPrompt += '\n\n<phrase_context>\n';
            systemPrompt += contextPrompt;
            systemPrompt += '\n</phrase_context>';
        }

        systemPrompt += '\n</system_prompt>';

        let attempt = 0;
        while (attempt <= ChatGPTTranslator.MAX_RETRIES) {
            try {
                const result = await this.openai.promptChatCompletions({
                    systemPrompt,
                    userPrompt: text,
                });

                const fixedResult = this.fixChineseBracketsInMarkdown(result);

                if (this.validateTemplatePlaceholders(text, fixedResult) && this.validateTemplateHTML(text, fixedResult)) {
                    if (attempt > 0) {
                        console.log(`🙃 Translation succeeded after ${attempt + 1} attempts`);
                    }
                    return fixedResult;
                }

                console.warn(`⚠️ Translation for "${text}" failed validation (attempt ${attempt + 1}/${ChatGPTTranslator.MAX_RETRIES + 1})`);

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
}

export default ChatGPTTranslator;
