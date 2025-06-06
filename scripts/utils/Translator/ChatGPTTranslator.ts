import OpenAI from 'openai';
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

    protected async performTranslation(text: string, targetLang: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional translator. Translate the following text to ${targetLang}. It is either a plain string or a TypeScript template string. Preserve placeholders like \${username}, \${count}, \${123456} etc without modifying their contents or removing the brackets. In most cases, the contents of the placeholders are descriptive of what they represent in the phrase, but in some cases the placeholders may just contain a number. If it can't be translated, reply with the same text unchanged. Be cautious not to change any URLs.`,
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
