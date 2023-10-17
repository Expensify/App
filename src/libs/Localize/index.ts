import Str from 'expensify-common/lib/str';
import * as RNLocalize from 'react-native-localize';
import Log from '../Log';
import Config from '../../CONFIG';
import translations from '../../languages/translations';
import CONST from '../../CONST';
import LocaleListener from './LocaleListener';
import BaseLocaleListener from './LocaleListener/BaseLocaleListener';
import {TranslationFlatObject, TranslationPaths} from '../../languages/types';

// Listener when an update in Onyx happens so we use the updated locale when translating/localizing items.
LocaleListener.connect();

// Note: This has to be initialized inside a function and not at the top level of the file, because Intl is polyfilled,
// and if React Native executes this code upon import, then the polyfill will not be available yet and it will barf
let CONJUNCTION_LIST_FORMATS_FOR_LOCALES: Record<string, Intl.ListFormat>;
function init() {
    CONJUNCTION_LIST_FORMATS_FOR_LOCALES = Object.values(CONST.LOCALES).reduce((memo: Record<string, Intl.ListFormat>, locale) => {
        // This is not a supported locale, so we'll use ES_ES instead
        if (locale === CONST.LOCALES.ES_ES_ONFIDO) {
            // eslint-disable-next-line no-param-reassign
            memo[locale] = new Intl.ListFormat(CONST.LOCALES.ES_ES, {style: 'long', type: 'conjunction'});
            return memo;
        }

        // eslint-disable-next-line no-param-reassign
        memo[locale] = new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'});
        return memo;
    }, {});
}

type PhraseParameters<T> = T extends (arg: infer A) => string ? A : never;

/**
 * Return translated string for given locale and phrase
 *
 * @param [desiredLanguage] eg 'en', 'es-ES'
 * @param [phraseParameters] Parameters to supply if the phrase is a template literal.
 */
function translate<TKey extends TranslationPaths>(
    desiredLanguage: 'en' | 'es' | 'es-ES' | 'es_ES',
    phraseKey: TKey,
    phraseParameters: PhraseParameters<TranslationFlatObject[TKey]> = {} as PhraseParameters<TranslationFlatObject[TKey]>,
): string {
    const languageAbbreviation = desiredLanguage.substring(0, 2) as 'en' | 'es';

    // Search phrase in full locale e.g. es-ES
    const desiredLanguageDictionary = translations?.[desiredLanguage];
    let translatedPhrase = desiredLanguageDictionary[phraseKey];
    if (translatedPhrase) {
        return Str.result(translatedPhrase, phraseParameters);
    }

    // Phrase is not found in full locale, search it in fallback language e.g. es
    const fallbackLanguageDictionary = translations[languageAbbreviation] || {};
    translatedPhrase = fallbackLanguageDictionary?.[phraseKey] ?? '';
    if (translatedPhrase) {
        return Str.result(translatedPhrase, phraseParameters);
    }
    if (languageAbbreviation !== CONST.LOCALES.DEFAULT) {
        Log.alert(`${phraseKey} was not found in the ${languageAbbreviation} locale`);
    }

    // Phrase is not translated, search it in default language (en)
    const defaultLanguageDictionary = translations[CONST.LOCALES.DEFAULT] || {};
    translatedPhrase = defaultLanguageDictionary[phraseKey] ?? '';
    if (translatedPhrase) {
        return Str.result(translatedPhrase, phraseParameters);
    }

    // Phrase is not found in default language, on production log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION) {
        const phraseString = Array.isArray(phraseKey) ? phraseKey.join('.') : phraseKey;
        Log.alert(`${phraseString} was not found in the en locale`);
        return phraseString;
    }
    throw new Error(`${phraseKey} was not found in the default language`);
}

/**
 * Uses the locale in this file updated by the Onyx subscriber.
 */
function translateLocal<TKey extends TranslationPaths>(phrase: TKey, variables: PhraseParameters<TranslationFlatObject[TKey]> = {} as PhraseParameters<TranslationFlatObject[TKey]>) {
    return translate(BaseLocaleListener.getPreferredLocale(), phrase, variables);
}

/**
 * Return translated string for given error.
 */
function translateIfPhraseKey(message: string | [string, {isTranslated: boolean}]): string {
    if (!message || (Array.isArray(message) && message.length > 0)) {
        return '';
    }

    try {
        // check if error message has a variable parameter
        const [phrase, variables] = Array.isArray(message) ? message : [message];

        // This condition checks if the error is already translated. For example, if there are multiple errors per input, we handle translation in ErrorUtils.addErrorMessage due to the inability to concatenate error keys.

        if (variables && variables.isTranslated) {
            return phrase;
        }

        return translateLocal(phrase, variables);
    } catch (error) {
        return Array.isArray(message) ? message[0] : message;
    }
}

/**
 * Format an array into a string with comma and "and" ("a dog, a cat and a chicken")
 */
function arrayToString(anArray: string[]) {
    if (!CONJUNCTION_LIST_FORMATS_FOR_LOCALES) {
        init();
    }
    const listFormat = CONJUNCTION_LIST_FORMATS_FOR_LOCALES[BaseLocaleListener.getPreferredLocale()];
    return listFormat.format(anArray);
}

/**
 * Returns the user device's preferred language.
 */
function getDevicePreferredLocale(): string {
    return RNLocalize.findBestAvailableLanguage([CONST.LOCALES.EN, CONST.LOCALES.ES])?.languageTag ?? CONST.LOCALES.DEFAULT;
}

export {translate, translateLocal, translateIfPhraseKey, arrayToString, getDevicePreferredLocale};
