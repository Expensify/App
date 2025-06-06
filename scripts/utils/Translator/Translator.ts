import type Locale from '../../../src/types/onyx/Locale';

abstract class Translator {
    /**
     * Translate a string to the given locale.
     * Implements common logging logic, while concrete subclasses handle actual translations.
     */
    public async translate(text: string, targetLang: Locale): Promise<string> {
        const isEmpty = !text || text.trim().length === 0;
        if (isEmpty) {
            return '';
        }
        const result = await this.performTranslation(text, targetLang);
        const prefix = `🧠 Translated to [${targetLang}]: `;
        console.log(`${prefix}"${this.trimForLogs(text)}"\n${''.padStart(prefix.length - 2, ' ')}→ "${this.trimForLogs(result)}"`);
        return result;
    }

    /**
     * Translate a string to the given locale.
     */
    protected abstract performTranslation(text: string, targetLang: string): Promise<string>;

    /**
     * Trim a string to keep logs readable.
     */
    private trimForLogs(text: string) {
        return `${text.slice(0, 80)}${text.length > 80 ? '...' : ''}`;
    }
}

export default Translator;
