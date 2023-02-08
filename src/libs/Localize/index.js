import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Log from '../Log';
import Config from '../../CONFIG';
import translations from '../../languages/translations';
import CONST from '../../CONST';
import LocaleListener from './LocaleListener';
import BaseLocaleListener from './LocaleListener/BaseLocaleListener';

// Listener when an update in Onyx happens so we use the updated locale when translating/localizing items.
LocaleListener.connect();

/**
 * Return translated string for given locale and phrase
 *
 * @param {String} [desiredLanguage] eg 'en', 'es-ES'
 * @param {String|Array} phraseKey
 * @param {Object} [phraseParameters] Parameters to supply if the phrase is a template literal.
 * @returns {String}
 */
function translate(desiredLanguage = CONST.DEFAULT_LOCALE, phraseKey, phraseParameters = {}) {
    const languageAbbreviation = desiredLanguage.substring(0, 2);
    let translatedPhrase;

    // Search phrase in full locale e.g. es-ES
    const desiredLanguageDictionary = lodashGet(translations, desiredLanguage);
    translatedPhrase = lodashGet(desiredLanguageDictionary, phraseKey);
    if (translatedPhrase) {
        return Str.result(translatedPhrase, phraseParameters);
    }

    // Phrase is not found in full locale, search it in fallback language e.g. es
    const fallbackLanguageDictionary = lodashGet(translations, languageAbbreviation);
    translatedPhrase = lodashGet(fallbackLanguageDictionary, phraseKey);
    if (translatedPhrase) {
        return Str.result(translatedPhrase, phraseParameters);
    }
    if (languageAbbreviation !== 'en') {
        Log.alert(`${phraseKey} was not found in the ${languageAbbreviation} locale`);
    }

    // Phrase is not translated, search it in default language (en)
    const defaultLanguageDictionary = lodashGet(translations, 'en', {});
    translatedPhrase = lodashGet(defaultLanguageDictionary, phraseKey);
    if (translatedPhrase) {
        return Str.result(translatedPhrase, phraseParameters);
    }

    // Phrase is not found in default language, on production log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION) {
        const phraseString = _.isArray(phraseKey) ? phraseKey.join('.') : phraseKey;
        Log.alert(`${phraseString} was not found in the en locale`);
        return phraseString;
    }
    throw new Error(`${phraseKey} was not found in the default language`);
}

/**
 * Uses the locale in this file updated by the Onyx subscriber.
 *
 * @param {String|Array} phrase
 * @param {Object} [variables]
 * @returns {String}
 */
function translateLocal(phrase, variables) {
    return translate(BaseLocaleListener.getPreferredLocale(), phrase, variables);
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
