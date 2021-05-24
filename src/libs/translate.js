import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Log from './Log';
import Config from '../CONFIG';
import translations from '../languages/translations';

/**
 * Return translated string for given locale and phrase
 *
 * @param {String} [locale] eg 'en', 'es-ES'
 * @param {String|Array} phrase
 * @param {Object} [variables]
 * @returns {String}
 */
function translate(locale = 'en', phrase, variables = {}) {
    const localeLanguage = locale.substring(0, 2);
    const fullLocale = lodashGet(translations, locale, {});
    const language = lodashGet(translations, localeLanguage, {});
    const defaultLanguage = lodashGet(translations, 'en', {});

    let translationValue;

    // Search phrase in full locale
    translationValue = lodashGet(fullLocale, phrase);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }

    // Phrase is not found in full locale, search it in language
    translationValue = lodashGet(language, phrase);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }
    if (localeLanguage !== 'en') {
        Log.alert(`${phrase} was not found in the ${localeLanguage} locale`, 0, {}, false);
    }

    // Phrase is not translated, search it in default language (en)
    translationValue = lodashGet(defaultLanguage, phrase);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }

    // Phrase is not found in default language, on production log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION) {
        const phraseString = Array.isArray(phrase) ? phrase.join('.') : phrase;
        Log.alert(`${phraseString} was not found in the en locale`, 0, {}, false);
        return phraseString;
    }
    throw new Error(`${phrase} was not found in the default language`);
}

export {

    // Ignoring this lint error in case of we want to export more functions from this library
    // eslint-disable-next-line import/prefer-default-export
    translate,
};
