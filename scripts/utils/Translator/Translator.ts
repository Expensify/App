import {DomUtils, parseDocument} from 'htmlparser2';
import type {TranslationTargetLocale} from '@src/CONST/LOCALES';
import type {StringWithContext} from './types';

/**
 * Base Translator class standardizes interface for translators and implements common logging.
 */
abstract class Translator {
    /**
     * Translate a string to the given locale.
     * Implements common logging logic, while concrete subclasses handle actual translations.
     */
    public async translate(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string> {
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
    protected abstract performTranslation(targetLang: TranslationTargetLocale, text: string, context?: string): Promise<string>;

    /**
     * Estimate cost for translating the given strings across locales.
     */
    public abstract estimateCost(stringsToTranslate: StringWithContext[], targetLanguages: TranslationTargetLocale[]): Promise<number>;

    /**
     * Get all translations that failed after exhausting retries.
     * Used for summary reporting at the end of a translation run.
     */
    public abstract getFailedTranslations(): Array<{text: string; targetLang: TranslationTargetLocale; error: string}>;

    /**
     * Trim a string to keep logs readable.
     */
    private trimForLogs(text: string) {
        return `${text.slice(0, 80)}${text.length > 80 ? '...' : ''}`;
    }

    /**
     * Replace Chinese full-width brackets 【 (U+3010) and 】 (U+3011) with normal ASCII brackets [ and ]
     */
    public fixChineseBracketsInMarkdown(text: string): string {
        return text
            .replaceAll('\u3010', '[') // 【
            .replaceAll('\u3011', ']'); // 】
    }

    /**
     * Validate that placeholders are all present and unchanged before and after translation.
     */
    public validateTemplatePlaceholders(original: string, translated: string): boolean {
        const extractPlaceholders = (s: string) =>
            Array.from(s.matchAll(/\$\{[^}]*}/g))
                .map((m) => m[0])
                .sort();
        const originalSpans = extractPlaceholders(original);
        const translatedSpans = extractPlaceholders(translated);
        return JSON.stringify(originalSpans) === JSON.stringify(translatedSpans);
    }

    /**
     * Validate that the HTML structure is the same before and after translation.
     */
    public validateTemplateHTML(original: string, translated: string): boolean {
        // Attributes that are allowed to be translated
        const TRANSLATABLE_ATTRIBUTES = new Set(['alt', 'title', 'placeholder', 'aria-label', 'aria-describedby', 'aria-labelledby', 'value']);

        const parseHTMLStructure = (s: string) => {
            const doc = parseDocument(s);
            const elements = DomUtils.getElementsByTagName(() => true, doc, true);

            return elements.map((element) => {
                const tagName = element.name.toLowerCase();

                // Extract attributes, excluding translatable ones
                const attributes: string[] = [];
                if (element.attribs) {
                    for (const [attrName, attrValue] of Object.entries(element.attribs ?? {})) {
                        const normalizedAttrName = attrName.toLowerCase();
                        if (!TRANSLATABLE_ATTRIBUTES.has(normalizedAttrName)) {
                            attributes.push(`${normalizedAttrName}="${attrValue ?? ''}"`);
                        }
                    }
                }

                return {
                    tagName,
                    attributes: attributes.sort(),
                };
            });
        };

        const originalStructure = parseHTMLStructure(original);
        const translatedStructure = parseHTMLStructure(translated);

        // Serialize and sort for order-independent comparison (preserves duplicates)
        const originalSorted = originalStructure.map((el) => JSON.stringify(el)).sort();
        const translatedSorted = translatedStructure.map((el) => JSON.stringify(el)).sort();

        return JSON.stringify(originalSorted) === JSON.stringify(translatedSorted);
    }
}

export default Translator;
