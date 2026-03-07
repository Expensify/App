import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import Translator from './Translator';

class DummyTranslator extends Translator {
    protected performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
        return Promise.resolve(`[${targetLang}]${context ? `[ctx: ${context}]` : ''} ${text}`);
    }

    public estimateCost(): Promise<number> {
        return Promise.resolve(0);
    }

    public getFailedTranslations(): Array<{text: string; targetLang: TranslationTargetLocale; error: string; id?: string}> {
        return []; // Dummy translator never fails
    }
}

export default DummyTranslator;
