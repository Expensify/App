import StringUtils from '@libs/StringUtils';
import getBasePrompt from '@prompts/translation/base';
import getContextPrompt from '@prompts/translation/context';
import type Locale from '@src/types/onyx/Locale';
import OpenAIUtils from '../OpenAIUtils';
import Translator from './Translator';

class ChatGPTTranslator extends Translator {
    /**
     * OpenAI API client to perform translations.
     */
    private readonly openai: OpenAIUtils;

    public constructor(apiKey: string) {
        super();
        this.openai = new OpenAIUtils(apiKey);
    }

    protected async performTranslation(targetLang: Locale, text: string, context?: string): Promise<string> {
        try {
            const systemPrompt = StringUtils.dedent(`
                ${getBasePrompt(targetLang)}
                ${getContextPrompt(context)}
            `);
            const result = await this.openai.promptChatCompletions({
                systemPrompt,
                userPrompt: text,
            });
            console.log(`🧠 Translated "${text}" to ${targetLang}: "${result}"`);
            return result;
        } catch (error) {
            console.error(`Error translating "${text}" to ${targetLang}:`, error);
            return text; // Fallback to English if translation fails
        }
    }
}

export default ChatGPTTranslator;
