import en from './en';
import es from './es';
import esES from './es-ES';
import type {TranslationDeepObject, TranslationFlatObject} from './types';

/**
 * Converts an object to it's flattened version.
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: { "common.yes": "Yes", "common.no": "No" }
 */
// Necessary to export so that it is accessible to the unit tests
// eslint-disable-next-line rulesdir/no-inline-named-export
export function flattenObject<T = typeof en>(obj: TranslationDeepObject<T>): TranslationFlatObject {
    const result: Record<string, unknown> = {};

    const recursive = (data: TranslationDeepObject<T>, key: string): void => {
        // If the data is a function or not a object (eg. a string or array),
        // it's the final value for the key being built and there is no need
        // for more recursion
        if (typeof data === 'function' || Array.isArray(data) || !(typeof data === 'object' && !!data)) {
            result[key] = data;
        } else {
            let isEmpty = true;

            // Recursive call to the keys and connect to the respective data
            Object.keys(data).forEach((k) => {
                isEmpty = false;
                // @ts-expect-error - The key is a string since forEach is always iterating over the keys like strings
                recursive(data[k] as TranslationDeepObject<T>, key ? `${key}.${k}` : k);
            });

            // Check for when the object is empty but a key exists, so that
            // it defaults to an empty object
            if (isEmpty && key) {
                result[key] = '';
            }
        }
    };

    recursive(obj, '');
    return result as TranslationFlatObject;
}

export default {
    en: flattenObject(en),
    es: flattenObject(es),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'es-ES': flattenObject(esES),
};
