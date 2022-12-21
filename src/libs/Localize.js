import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import Log from './Log';
import Config from '../CONFIG';
import translations from '../languages/translations';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

let preferredLocale = CONST.DEFAULT_LOCALE;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => {
        if (!val) {
            return;
        }

        preferredLocale = val;
    },
});

/**
 * Return translated string for given locale and phrase
 *
 * @param {String} [abreviatedDialect] eg 'en', 'es-ES'
 * @param {String|Array} phrase
 * @param {Object} [variables]
 * @returns {String}
 */
function translate(abreviatedDialect = CONST.DEFAULT_LOCALE, phrase, variables = {}) {
    const abreviatedLanguage = abreviatedDialect.substring(0, 2);
    const allTranslatedCopy = lodashGet(translations, abreviatedDialect, {});
    const language = lodashGet(translations, abreviatedLanguage, {});
    const defaultLanguage = lodashGet(translations, 'en', {});

    let translationValue;

    // Search phrase in full locale
    translationValue = lodashGet(allTranslatedCopy, phrase);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }

    // Phrase is not found in full locale, search it in language
    translationValue = lodashGet(language, phrase);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }
    if (abreviatedLanguage !== 'en') {
        Log.alert(`${phrase} was not found in the ${abreviatedLanguage} locale`);
    }

    // Phrase is not translated, search it in default language (en)
    translationValue = lodashGet(defaultLanguage, phrase);
    if (translationValue) {
        return Str.result(translationValue, variables);
    }

    // Phrase is not found in default language, on production log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION) {
        const phraseString = _.isArray(phrase) ? phrase.join('.') : phrase;
        Log.alert(`${phraseString} was not found in the en locale`);
        return phraseString;
    }
    throw new Error(`${phrase} was not found in the default language`);
}

/**
 * Uses the locale in this file updated by the Onyx subscriber.
 *
 * @param {String|Array} phrase
 * @param {Object} [variables]
 * @returns {String}
 */
function translateLocal(phrase, variables) {
    return translate(preferredLocale, phrase, variables);
}

/**
 * Format an array into a string with comma and "and" ("a dog, a cat and a chicken")
 *
 * @param {Array} anArray
 * @return {String}
 */
function arrayToString(anArray) {
    const and = this.translateLocal('common.and');
    let aString = '';
    if (_.size(anArray) === 1) {
        aString = anArray[0];
    } else if (_.size(anArray) === 2) {
        aString = anArray.join(` ${and} `);
    } else if (_.size(anArray) > 2) {
        aString = `${anArray.slice(0, -1).join(', ')} ${and} ${anArray.slice(-1)}`;
    }
    return aString;
}

export {
    translate,
    translateLocal,
    arrayToString,
};
