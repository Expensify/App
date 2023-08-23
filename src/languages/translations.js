import _ from 'underscore';
import en from './en';
import es from './es';
import esES from './es-ES';

/**
 * Converts an object to it's flattened version.
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: { "common.yes": "Yes", "common.no": "No" }
 *
 * @param {Object} obj
 * @returns {Object}
 */
// Necessary to export so that it is accessible to the unit tests
// eslint-disable-next-line rulesdir/no-inline-named-export
export function flattenObject(obj) {
    const result = {};

    const recursive = (data, key) => {
        // If the data is a function or not a object (eg. a string), it's
        // the value of the key being built and no need for more recursion
        if (_.isFunction(data) || _.isArray(data) || !_.isObject(data)) {
            result[key] = data;
        } else {
            let isEmpty = true;

            // Recursive call to the keys and connect to the respective data
            _.keys(data).forEach((k) => {
                isEmpty = false;
                recursive(data[k], key ? `${key}.${k}` : k);
            });

            // Check for when the object is empty but a key exists, so that
            // it defaults to an empty object
            if (isEmpty && key) {
                result[key] = {};
            }
        }
    };

    recursive(obj, '');
    return result;
}

export default {
    en: flattenObject(en),
    es: flattenObject(es),
    'es-ES': esES,
};
