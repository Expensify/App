import hashStr from '@libs/StringUtils/hash';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import OpenAIUtils from '../OpenAIUtils';
import Translator from './Translator';
import {buildTranslationInstructions, buildTranslationRequestInput} from './TranslationPromptUtils';

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
    private static readonly MAX_RETRIES: number = 4;

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

        const instructions = await this.getInstructions(targetLang);
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
     * Build and cache the system instructions for a locale, using the base prompt and locale-specific prompt.
     */
    private async getInstructions(targetLang: TranslationTargetLocale): Promise<string> {
        const cached = this.instructionsCache.get(targetLang);
        if (cached) {
            return cached;
        }

        const instructions = await buildTranslationInstructions(targetLang);
        this.instructionsCache.set(targetLang, instructions);
        return instructions;
    }

    protected async performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
        const session = await this.getOrCreateSession(targetLang);
        const instructions = await this.getInstructions(targetLang);
        const userInput = buildTranslationRequestInput(text, context);

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
