import type Locale from '../../../src/types/onyx/Locale';

type Translator = {
    /**
     * Translate a single string to a target language.
     */
    translate(text: string, targetLang: Locale): Promise<string>;
};

export default Translator;
