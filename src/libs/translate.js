import lodashGet from 'lodash.get';
import Str from 'expensify-common/lib/str';
import Log from './Log';
import Config from '../CONFIG';
import translations from '../languages/translations';

/**
 * Return translated string for given locale and key
 *
 * @param {String} locale eg 'en', 'es-ES'
 * @param {String|Array} key
 * @param {Object} variables
 * @returns {string}
 */
function translate(locale, key, variables = {}) {
    const localeLanguage = locale.substring(0, 2);
    const fullLocale = lodashGet(translations, locale, {});
    const language = lodashGet(translations, localeLanguage, {});
    const defaultLanguage = lodashGet(translations, 'en', {});

    let translationValue;

    // Search key in full locale
    translationValue = lodashGet(fullLocale, key);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }

    // Key is not found in full locale, search it in language
    translationValue = lodashGet(language, key);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }
    if (localeLanguage !== 'en') {
        Log.alert(`${key} was not found in the ${localeLanguage} locale`, 0, {}, false);
    }

    // Key is not translated, search it in default language (en)
    translationValue = lodashGet(defaultLanguage, key);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }

    // Key is not found in default language, on production log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION) {
        const keyString = Array.isArray(key) ? key.join('.') : key;
        Log.alert(`${keyString} was not found in the en locale`, 0, {}, false);
        return keyString;
    }
    throw new Error(`${key} was not found in the default language`);
}

export {

    // Ignoring this lint error in case of we want to export more functions from this library
    // eslint-disable-next-line import/prefer-default-export
    translate,
};
