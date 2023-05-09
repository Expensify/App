import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import * as RNLocalize from 'react-native-localize';
import Log from '../Log';
import Config from '../../CONFIG';
import translations from '../../languages/translations';
import CONST from '../../CONST';
import LocaleListener from './LocaleListener';
import BaseLocaleListener from './LocaleListener/BaseLocaleListener';

// Listener when an update in Onyx happens so we use the updated locale when translating/localizing items.
LocaleListener.connect();

// Note: This has to be initialized inside a function and not at the top level of the file, because Intl is polyfilled,
// and if React Native executes this code upon import, then the polyfill will not be available yet and it will barf
let CONJUNCTION_LIST_FORMATS_FOR_LOCALES;
function init() {
    CONJUNCTION_LIST_FORMATS_FOR_LOCALES = _.reduce(
        CONST.LOCALES,
        (memo, locale) => {
            // This is not a supported locale, so we'll use ES_ES instead
            if (locale === CONST.LOCALES.ES_ES_ONFIDO) {
                // eslint-disable-next-line no-param-reassign
                memo[locale] = new Intl.ListFormat(CONST.LOCALES.ES_ES, {style: 'long', type: 'conjunction'});
                return memo;
            }

            // eslint-disable-next-line no-param-reassign
            memo[locale] = new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'});
            return memo;
        },
        {},
    );
}

/**
 * Return translated string for given locale and phrase
 *
 * @param {String} [desiredLanguage] eg 'en', 'es-ES'
 * @param {String|Array} phraseKey
 * @param {Object} [phraseParameters] Parameters to supply if the phrase is a template literal.
 * @returns {String}
 */
function translate(desiredLanguage = CONST.LOCALES.DEFAULT, phraseKey, phraseParameters = {}) {
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
    if (languageAbbreviation !== CONST.LOCALES.DEFAULT) {
        Log.alert(`${phraseKey} was not found in the ${languageAbbreviation} locale`);
    }

    // Phrase is not translated, search it in default language (en)
    const defaultLanguageDictionary = lodashGet(translations, CONST.LOCALES.DEFAULT, {});
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
    if (!CONJUNCTION_LIST_FORMATS_FOR_LOCALES) {
        init();
    }
    const listFormat = CONJUNCTION_LIST_FORMATS_FOR_LOCALES[BaseLocaleListener.getPreferredLocale()];
    return listFormat.format(anArray);
}

/**
 * Returns the user device's preferred language.
 *
 * @return {String}
 */
function getDevicePreferredLocale() {
    return lodashGet(RNLocalize.findBestAvailableLanguage([CONST.LOCALES.EN, CONST.LOCALES.ES]), 'languageTag', CONST.LOCALES.DEFAULT);
}

export {translate, translateLocal, arrayToString, getDevicePreferredLocale};
