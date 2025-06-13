import type {TranslationTargetLanguage} from '@src/CONST/LOCALES';

/**
 * Base Translator class standardizes interface for translators and implements common logging.
 */
abstract class Translator {
    /**
     * Translate a string to the given locale.
     * Implements common logging logic, while concrete subclasses handle actual translations.
     */
    public async translate(targetLang: TranslationTargetLanguage, text: string, context?: string): Promise<string> {
        const isEmpty = !text || text.trim().length === 0;
        if (isEmpty) {
            return '';
        }
        const result = await this.performTranslation(targetLang, text, context);
        const prefix = `🧠 Translated to [${targetLang}]: `;
        console.log(`${prefix}"${this.trimForLogs(text)}"\n${''.padStart(prefix.length - 2, ' ')}→ "${this.trimForLogs(result)}"`);
        if (context) {
            console.log(`${''.padStart(prefix.length - 2, ' ')}[context] ${this.trimForLogs(context)}`);
        }
        return result;
    }

    /**
     * Translate a string to the given locale.
     */
    protected abstract performTranslation(targetLang: TranslationTargetLanguage, text: string, context?: string): Promise<string>;

    /**
     * Trim a string to keep logs readable.
     */
    private trimForLogs(text: string) {
        return `${text.slice(0, 80)}${text.length > 80 ? '...' : ''}`;
    }
}

export default Translator;
