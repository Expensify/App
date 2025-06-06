import type Locale from '../../../src/types/onyx/Locale';
import type Translator from './types';

class DummyTranslator implements Translator {
    public async translate(text: string, targetLang: Locale): Promise<string> {
        return Promise.resolve(`[${targetLang}] ${text}`);
    }
}

export default DummyTranslator;
