import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import Translator from './Translator';

class DummyTranslator extends Translator {
    protected performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
        return Promise.resolve(`[${targetLang}]${context ? `[ctx: ${context}]` : ''} ${text}`);
    }
}

export default DummyTranslator;
