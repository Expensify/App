import Translator from './Translator';

class DummyTranslator extends Translator {
    protected performTranslation(text: string, targetLang: string): Promise<string> {
        return Promise.resolve(`[${targetLang}] ${text}`);
    }
}

export default DummyTranslator;
