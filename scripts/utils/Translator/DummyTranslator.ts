import Translator from './Translator';

class DummyTranslator extends Translator {
    protected performTranslation(targetLang: string, text: string): Promise<string> {
        return Promise.resolve(`[${targetLang}] ${text}`);
    }
}

export default DummyTranslator;
