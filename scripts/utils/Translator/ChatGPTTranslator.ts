import ChatGPTCostEstimator from '@scripts/chatGPTCostEstimator';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import OpenAIUtils from '../OpenAIUtils';
import {buildTranslationInstructions, buildTranslationRequestInput} from './TranslationPromptUtils';
import Translator from './Translator';
import type {StringWithContext} from './types';

/**
 * Represents a translation that failed after all retries.
 */
type FailedTranslation = {
    text: string;
    targetLang: TranslationTargetLocale;
    error: string;
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
     * Tracks translations that failed after all retries, for summary reporting.
     */
    private readonly failedTranslations: FailedTranslation[] = [];

    public constructor(apiKey: string) {
        super();
        this.openai = new OpenAIUtils(apiKey);
    }

    /**
     * Get all translations that failed after exhausting retries.
     */
    public getFailedTranslations(): FailedTranslation[] {
        return [...this.failedTranslations];
    }

    protected async performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
        const instructions = await buildTranslationInstructions(targetLang);
        const userInput = buildTranslationRequestInput(text, context);

        let attempt = 0;
        while (attempt <= ChatGPTTranslator.MAX_RETRIES) {
            try {
                const response = await this.openai.promptResponses({
                    input: userInput,
                    instructions,
                    promptCacheKey: `translation-${targetLang}`,
                });

                const fixedResult = this.fixChineseBracketsInMarkdown(response.text);

                if (this.validateTemplatePlaceholders(text, fixedResult) && this.validateTemplateHTML(text, fixedResult)) {
                    if (attempt > 0) {
                        console.log(`🙃 Translation succeeded after ${attempt + 1} attempts`);
                    }
                    return fixedResult;
                }

                console.warn(`⚠️ Translation for "${text}" failed validation (attempt ${attempt + 1}/${ChatGPTTranslator.MAX_RETRIES + 1})`);

                if (attempt === ChatGPTTranslator.MAX_RETRIES) {
                    console.error(`❌ Final attempt failed placeholder validation. Falling back to original.`);
                    this.failedTranslations.push({text, targetLang, error: 'Failed placeholder/HTML validation after all retries'});
                    return text;
                }
            } catch (error) {
                console.error(`Error translating "${text}" to ${targetLang} (attempt ${attempt + 1}):`, error);

                if (attempt === ChatGPTTranslator.MAX_RETRIES) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    this.failedTranslations.push({text, targetLang, error: errorMessage});
                    return text; // Final fallback
                }
            }

            attempt++;
        }

        // Should never hit this, but fallback just in case
        return text;
    }

    /**
     * Estimate cost for translation runs based on current prompt structure.
     */
    public async estimateCost(stringsToTranslate: StringWithContext[], targetLanguages: TranslationTargetLocale[]): Promise<number> {
        if (stringsToTranslate.length === 0 || targetLanguages.length === 0) {
            return 0;
        }

        let perLocaleInputTokens = 0;
        let perLocaleOutputTokens = 0;
        for (const {text, context} of stringsToTranslate) {
            const requestInput = buildTranslationRequestInput(text, context);
            perLocaleInputTokens += Math.ceil(requestInput.length * ChatGPTCostEstimator.TOKENS_PER_CHAR);

            const outputTokens = Math.ceil(text.length * ChatGPTCostEstimator.TOKENS_PER_CHAR);
            perLocaleOutputTokens += outputTokens;
        }

        const totalOutputTokens = perLocaleOutputTokens * targetLanguages.length;

        const perLocaleInstructionTokens = await Promise.all(
            targetLanguages.map(async (locale) => {
                const instructions = await buildTranslationInstructions(locale);
                return Math.ceil(instructions.length * ChatGPTCostEstimator.TOKENS_PER_CHAR);
            }),
        );

        // Instructions are sent with every request.
        // First request per locale: uncached (full price)
        // Remaining requests per locale: cached (discounted price)
        const numStrings = stringsToTranslate.length;
        let totalUncachedInputTokens = perLocaleInputTokens * targetLanguages.length;
        let totalCachedInputTokens = 0;

        for (const instructionTokens of perLocaleInstructionTokens) {
            // First request per locale uses uncached instructions
            totalUncachedInputTokens += instructionTokens;
            // Remaining requests use cached instructions
            totalCachedInputTokens += instructionTokens * (numStrings - 1);
        }

        return ChatGPTCostEstimator.getTotalEstimatedCost(totalUncachedInputTokens, totalOutputTokens, totalCachedInputTokens);
    }
}

export default ChatGPTTranslator;
