import OpenAI from 'openai';
import getBasePrompt from '../../../prompts/translation/base';
import getContextPrompt from '../../../prompts/translation/context';
import StringUtils from '../../../src/libs/StringUtils';
import type Locale from '../../../src/types/onyx/Locale';
import Translator from './Translator';

class ChatGPTTranslator extends Translator {
    /**
     * OpenAI API client to perform translations.
     */
    private readonly openai: OpenAI;

    public constructor(apiKey: string) {
        super();
        this.openai = new OpenAI({
            apiKey,
        });
    }

    protected async performTranslation(targetLang: Locale, text: string, context?: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: StringUtils.dedent(`
                            ${getBasePrompt(targetLang)}
                            ${getContextPrompt(context)}
                        `),
                    },
                    {role: 'user', content: text},
                ],
                temperature: 0.3,
            });
            const result = response.choices.at(0)?.message?.content?.trim() ?? text;
            console.log(`🧠 Translated "${text}" to ${targetLang}: "${result}"`);
            return result;
        } catch (error) {
            console.error(`Error translating "${text}" to ${targetLang}:`, error);
            return text; // Fallback to English if translation fails
        }
    }
}

export default ChatGPTTranslator;
