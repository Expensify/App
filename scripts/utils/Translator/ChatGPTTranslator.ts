import hashStr from '@libs/StringUtils/hash';
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

/**
 * Session state for a single locale, maintaining conversation context across translations.
 */
type LocaleSession = {
    conversationID: string;
    promptCacheKey: string;
    lastResponseID?: string;
};

class ChatGPTTranslator extends Translator {
    /**
     * The maximum number of times we'll retry a successful translation request in the event of hallucinations.
     */
    public static readonly MAX_RETRIES: number = 4;

    /**
     * OpenAI API client to perform translations.
     */
    private readonly openai: OpenAIUtils;

    /**
     * Per-locale session state, created lazily on first use of each locale.
     */
    private readonly sessions = new Map<TranslationTargetLocale, LocaleSession>();

    /**
     * Cached system instructions per locale.
     */
    private readonly instructionsCache = new Map<TranslationTargetLocale, string>();

    public constructor(apiKey: string) {
        super();
        this.openai = new OpenAIUtils(apiKey);
    }

    /**
     * Gets or creates a session for the given locale, initializing the conversation and prompt cache key.
     */
    private async getOrCreateSession(targetLang: TranslationTargetLocale): Promise<LocaleSession> {
        const existing = this.sessions.get(targetLang);
        if (existing) {
            return existing;
        }

        const instructions = await this.buildInstructions(targetLang);
        const conversationID = await this.openai.createConversation();
        const promptCacheKey = `translation-${targetLang}-${hashStr(instructions)}`;

        const session: LocaleSession = {
            conversationID,
            promptCacheKey,
        };
        this.sessions.set(targetLang, session);
        return session;
    }

    /**
     * Build the system instructions for a locale, using the base prompt and locale-specific prompt.
     */
    private async buildInstructions(targetLang: TranslationTargetLocale): Promise<string> {
        const cached = this.instructionsCache.get(targetLang);
        if (cached) {
            return cached;
        }

        let instructions = '<system_prompt>\n';
        instructions += '<base_prompt>\n';
        instructions += getBasePrompt(targetLang);
        instructions += '\n</base_prompt>';

        const localeSpecificPrompt = await getLocaleSpecificPrompt(targetLang);
        if (localeSpecificPrompt) {
            instructions += '\n\n<locale_specific_prompt language="' + targetLang + '">\n';
            instructions += localeSpecificPrompt;
            instructions += '\n</locale_specific_prompt>';
        }

        instructions += '\n</system_prompt>';
        this.instructionsCache.set(targetLang, instructions);
        return instructions;
    }

    /**
     * Build the user input for a translation request, including optional phrase context.
     */
    private buildUserInput(text: string, context?: string): string {
        let input = '<translation_request>\n';

        const contextPrompt = getContextPrompt(context);
        if (contextPrompt) {
            input += '<phrase_context>\n';
            input += contextPrompt;
            input += '\n</phrase_context>\n';
        }

        input += '<text_to_translate>\n';
        input += text;
        input += '\n</text_to_translate>\n';
        input += '</translation_request>';

        return input;
    }

    protected async performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
        const session = await this.getOrCreateSession(targetLang);
        const instructions = await this.buildInstructions(targetLang);
        const userInput = this.buildUserInput(text, context);

        let attempt = 0;
        while (attempt <= ChatGPTTranslator.MAX_RETRIES) {
            try {
                const response = await this.openai.promptResponses({
                    input: userInput,
                    instructions,
                    conversationID: session.conversationID,
                    previousResponseID: session.lastResponseID,
                    promptCacheKey: session.promptCacheKey,
                });

                const fixedResult = this.fixChineseBracketsInMarkdown(response.text);

                if (this.validateTemplatePlaceholders(text, fixedResult) && this.validateTemplateHTML(text, fixedResult)) {
                    if (attempt > 0) {
                        console.log(`🙃 Translation succeeded after ${attempt + 1} attempts`);
                    }

                    // Only update lastResponseID on successful translation to maintain valid context
                    session.lastResponseID = response.responseID;
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
