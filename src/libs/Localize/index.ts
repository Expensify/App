import * as RNLocalize from 'react-native-localize';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Log from '@libs/Log';
import type {MessageElementBase, MessageTextElement} from '@libs/MessageElement';
import Config from '@src/CONFIG';
import CONST from '@src/CONST';
import translations from '@src/languages/translations';
import type {PluralForm, TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale} from '@src/types/onyx';
import LocaleListener from './LocaleListener';
import BaseLocaleListener from './LocaleListener/BaseLocaleListener';

// Current user mail is needed for handling missing translations
let userEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        if (!val) {
            return;
        }
        userEmail = val?.email ?? '';
    },
});

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

/**
 * Map to store translated values for each locale.
 * This is used to avoid translating the same phrase multiple times.
 *
 * The data is stored in the following format:
 *
 * {
 *  "en": {
 *   "name": "Name",
 * }
 *
 * Note: We are not storing any translated values for phrases with variables,
 * as they have higher chance of being unique, so we'll end up wasting space
 * in our cache.
 */
const translationCache = new Map<ValueOf<typeof CONST.LOCALES>, Map<TranslationPaths, string>>(
    Object.values(CONST.LOCALES).reduce((cache, locale) => {
        cache.push([locale, new Map<TranslationPaths, string>()]);
        return cache;
    }, [] as Array<[ValueOf<typeof CONST.LOCALES>, Map<TranslationPaths, string>]>),
);

/**
 * Helper function to get the translated string for given
 * locale and phrase. This function is used to avoid
 * duplicate code in getTranslatedPhrase and translate functions.
 *
 * This function first checks if the phrase is already translated
 * and in the cache, it returns the translated value from the cache.
 *
 * If the phrase is not translated, it checks if the phrase is
 * available in the given locale. If it is, it translates the
 * phrase and stores the translated value in the cache and returns
 * the translated value.
 */
function getTranslatedPhrase<TKey extends TranslationPaths>(
    language: 'en' | 'es' | 'es-ES',
    phraseKey: TKey,
    fallbackLanguage: 'en' | 'es' | null,
    ...parameters: TranslationParameters<TKey>
): string | null {
    // Get the cache for the above locale
    const cacheForLocale = translationCache.get(language);

    // Directly access and assign the translated value from the cache, instead of
    // going through map.has() and map.get() to avoid multiple lookups.
    const valueFromCache = cacheForLocale?.get(phraseKey);

    // If the phrase is already translated, return the translated value
    if (valueFromCache) {
        return valueFromCache;
    }

    const translatedPhrase = translations?.[language]?.[phraseKey];

    if (translatedPhrase) {
        if (typeof translatedPhrase === 'function') {
            /**
             * If the result of `translatedPhrase` is an object, check if it contains the 'count' parameter
             * to handle pluralization logic.
             * Alternatively, before evaluating the translated result, we can check if the 'count' parameter
             * exists in the passed parameters.
             */
            const translateFunction = translatedPhrase as unknown as (...parameters: TranslationParameters<TKey>) => string | PluralForm;
            const translateResult = translateFunction(...parameters);

            if (typeof translateResult === 'string') {
                return translateResult;
            }

            const phraseObject = parameters[0] as {count?: number};
            if (typeof phraseObject?.count !== 'number') {
                throw new Error(`Invalid plural form for '${phraseKey}'`);
            }

            const pluralRule = new Intl.PluralRules(language).select(phraseObject.count);

            const pluralResult = translateResult[pluralRule];
            if (pluralResult) {
                if (typeof pluralResult === 'string') {
                    return pluralResult;
                }

                return pluralResult(phraseObject.count);
            }

            if (typeof translateResult.other === 'string') {
                return translateResult.other;
            }

            return translateResult.other(phraseObject.count);
        }

        // We set the translated value in the cache only for the phrases without parameters.
        cacheForLocale?.set(phraseKey, translatedPhrase);
        return translatedPhrase;
    }

    if (!fallbackLanguage) {
        return null;
    }

    // Phrase is not found in full locale, search it in fallback language e.g. es
    const fallbackTranslatedPhrase = getTranslatedPhrase(fallbackLanguage, phraseKey, null, ...parameters);

    if (fallbackTranslatedPhrase) {
        return fallbackTranslatedPhrase;
    }

    if (fallbackLanguage !== CONST.LOCALES.DEFAULT) {
        Log.alert(`${phraseKey} was not found in the ${fallbackLanguage} locale`);
    }

    // Phrase is not translated, search it in default language (en)
    return getTranslatedPhrase(CONST.LOCALES.DEFAULT, phraseKey, null, ...parameters);
}

/**
 * Return translated string for given locale and phrase
 *
 * @param [desiredLanguage] eg 'en', 'es-ES'
 * @param [parameters] Parameters to supply if the phrase is a template literal.
 */
function translate<TPath extends TranslationPaths>(desiredLanguage: 'en' | 'es' | 'es-ES' | 'es_ES', path: TPath, ...parameters: TranslationParameters<TPath>): string {
    // Search phrase in full locale e.g. es-ES
    const language = desiredLanguage === CONST.LOCALES.ES_ES_ONFIDO ? CONST.LOCALES.ES_ES : desiredLanguage;
    // Phrase is not found in full locale, search it in fallback language e.g. es
    const languageAbbreviation = desiredLanguage.substring(0, 2) as 'en' | 'es';

    const translatedPhrase = getTranslatedPhrase(language, path, languageAbbreviation, ...parameters);
    if (translatedPhrase !== null && translatedPhrase !== undefined) {
        return translatedPhrase;
    }

    // Phrase is not found in default language, on production and staging log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION || Config.IS_IN_STAGING) {
        const phraseString = Array.isArray(path) ? path.join('.') : path;
        Log.alert(`${phraseString} was not found in the en locale`);
        if (userEmail.includes(CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN)) {
            return CONST.MISSING_TRANSLATION;
        }
        return phraseString;
    }
    throw new Error(`${path} was not found in the default language`);
}

/**
 * Uses the locale in this file updated by the Onyx subscriber.
 */
function translateLocal<TPath extends TranslationPaths>(phrase: TPath, ...parameters: TranslationParameters<TPath>) {
    return translate(BaseLocaleListener.getPreferredLocale(), phrase, ...parameters);
}

function getPreferredListFormat(): Intl.ListFormat {
    if (!CONJUNCTION_LIST_FORMATS_FOR_LOCALES) {
        init();
    }

    return CONJUNCTION_LIST_FORMATS_FOR_LOCALES[BaseLocaleListener.getPreferredLocale()];
}

/**
 * Format an array into a string with comma and "and" ("a dog, a cat and a chicken")
 */
function formatList(components: string[]) {
    const listFormat = getPreferredListFormat();
    return listFormat.format(components);
}

function formatMessageElementList<E extends MessageElementBase>(elements: readonly E[]): ReadonlyArray<E | MessageTextElement> {
    const listFormat = getPreferredListFormat();
    const parts = listFormat.formatToParts(elements.map((e) => e.content));
    const resultElements: Array<E | MessageTextElement> = [];

    let nextElementIndex = 0;
    for (const part of parts) {
        if (part.type === 'element') {
            /**
             * The standard guarantees that all input elements will be present in the constructed parts, each exactly
             * once, and without any modifications: https://tc39.es/ecma402/#sec-createpartsfromlist
             */
            const element = elements[nextElementIndex++];

            resultElements.push(element);
        } else {
            const literalElement: MessageTextElement = {
                kind: 'text',
                content: part.value,
            };

            resultElements.push(literalElement);
        }
    }

    return resultElements;
}

/**
 * Returns the user device's preferred language.
 */
function getDevicePreferredLocale(): Locale {
    return RNLocalize.findBestAvailableLanguage([CONST.LOCALES.EN, CONST.LOCALES.ES])?.languageTag ?? CONST.LOCALES.DEFAULT;
}

export {translate, translateLocal, formatList, formatMessageElementList, getDevicePreferredLocale};
