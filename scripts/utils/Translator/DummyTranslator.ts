import type Locale from '@src/types/onyx/Locale';
import Translator from './Translator';

class DummyTranslator extends Translator {
    protected performTranslation(targetLang: Locale, text: string, context?: string): Promise<string> {
        return Promise.resolve(`[${targetLang}]${context ? `[ctx: ${context}]` : ''} ${text}`);
    }
}

export default DummyTranslator;
