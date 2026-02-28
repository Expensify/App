import type {FlatTranslationsObject, TranslationDeepObject} from './types';

/**
 * Converts an object to it's flattened version.
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: { "common.yes": "Yes", "common.no": "No" }
 */
function flattenObject<TTranslations>(obj: TranslationDeepObject<TTranslations>): FlatTranslationsObject {
    const result: Record<string, unknown> = {};

    const recursive = (data: TranslationDeepObject, key: string): void => {
        // If the data is a function or not a object (eg. a string or array),
        // it's the final value for the key being built and there is no need
        // for more recursion
        if (typeof data === 'function' || Array.isArray(data) || !(typeof data === 'object' && !!data)) {
            result[key] = data;
        } else {
            let isEmpty = true;

            // Recursive call to the keys and connect to the respective data
            for (const k of Object.keys(data)) {
                isEmpty = false;
                recursive(data[k] as TranslationDeepObject, key ? `${key}.${k}` : k);
            }

            // Check for when the object is empty but a key exists, so that
            // it defaults to an empty object
            if (isEmpty && key) {
                result[key] = '';
            }
        }
    };

    recursive(obj, '');
    return result as FlatTranslationsObject;
}

export default flattenObject;
