import PropTypes from 'prop-types';
import * as RNLocalize from 'react-native-localize';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import type {MessageElementBase, MessageTextElement} from '@libs/MessageElement';
import Config from '@src/CONFIG';
import CONST from '@src/CONST';
import translations from '@src/languages/translations';
import type {TranslationFlatObject, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale} from '@src/types/onyx';
import type {ReceiptError} from '@src/types/onyx/Transaction';
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

type PhraseParameters<T> = T extends (...args: infer A) => string ? A : never[];
type Phrase<TKey extends TranslationPaths> = TranslationFlatObject[TKey] extends (...args: infer A) => unknown ? (...args: A) => string : string;

/**
 * Return translated string for given locale and phrase
 *
 * @param [desiredLanguage] eg 'en', 'es-ES'
 * @param [phraseParameters] Parameters to supply if the phrase is a template literal.
 */
function translate<TKey extends TranslationPaths>(desiredLanguage: 'en' | 'es' | 'es-ES' | 'es_ES', phraseKey: TKey, ...phraseParameters: PhraseParameters<Phrase<TKey>>): string {
    // Search phrase in full locale e.g. es-ES
    const language = desiredLanguage === CONST.LOCALES.ES_ES_ONFIDO ? CONST.LOCALES.ES_ES : desiredLanguage;
    let translatedPhrase = translations?.[language]?.[phraseKey] as Phrase<TKey>;
    if (translatedPhrase) {
        return typeof translatedPhrase === 'function' ? translatedPhrase(...phraseParameters) : translatedPhrase;
    }

    // Phrase is not found in full locale, search it in fallback language e.g. es
    const languageAbbreviation = desiredLanguage.substring(0, 2) as 'en' | 'es';
    translatedPhrase = translations?.[languageAbbreviation]?.[phraseKey] as Phrase<TKey>;
    if (translatedPhrase) {
        return typeof translatedPhrase === 'function' ? translatedPhrase(...phraseParameters) : translatedPhrase;
    }

    if (languageAbbreviation !== CONST.LOCALES.DEFAULT) {
        Log.alert(`${phraseKey} was not found in the ${languageAbbreviation} locale`);
    }

    // Phrase is not translated, search it in default language (en)
    translatedPhrase = translations?.[CONST.LOCALES.DEFAULT]?.[phraseKey] as Phrase<TKey>;
    if (translatedPhrase) {
        return typeof translatedPhrase === 'function' ? translatedPhrase(...phraseParameters) : translatedPhrase;
    }

    // Phrase is not found in default language, on production and staging log an alert to server
    // on development throw an error
    if (Config.IS_IN_PRODUCTION || Config.IS_IN_STAGING) {
        const phraseString: string = Array.isArray(phraseKey) ? phraseKey.join('.') : phraseKey;
        Log.alert(`${phraseString} was not found in the en locale`);
        if (userEmail.includes(CONST.EMAIL.EXPENSIFY_EMAIL_DOMAIN)) {
            return CONST.MISSING_TRANSLATION;
        }
        return phraseString;
    }
    throw new Error(`${phraseKey} was not found in the default language`);
}

/**
 * Uses the locale in this file updated by the Onyx subscriber.
 */
function translateLocal<TKey extends TranslationPaths>(phrase: TKey, ...variables: PhraseParameters<Phrase<TKey>>) {
    return translate(BaseLocaleListener.getPreferredLocale(), phrase, ...variables);
}

/**
 * Traslatable text with phrase key and/or variables
 * Use MaybePhraseKey for Typescript
 *
 * E.g. ['common.error.characterLimitExceedCounter', {length: 5, limit: 20}]
 */
const translatableTextPropTypes = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object]))]);

type MaybePhraseKey = string | null | [string, Record<string, unknown> & {isTranslated?: boolean}] | [];

/**
 * Return translated string for given error.
 */
function translateIfPhraseKey(message: MaybePhraseKey): string;
function translateIfPhraseKey(message: ReceiptError): ReceiptError;
function translateIfPhraseKey(message: MaybePhraseKey | ReceiptError): string | ReceiptError;
function translateIfPhraseKey(message: MaybePhraseKey | ReceiptError): string | ReceiptError {
    if (!message || (Array.isArray(message) && message.length === 0)) {
        return '';
    }

    try {
        // check if error message has a variable parameter
        const [phrase, variables] = Array.isArray(message) ? message : [message];

        // This condition checks if the error is already translated. For example, if there are multiple errors per input, we handle translation in ErrorUtils.addErrorMessage due to the inability to concatenate error keys.
        if (variables?.isTranslated) {
            return phrase;
        }

        return translateLocal(phrase as TranslationPaths, variables as never);
    } catch (error) {
        return Array.isArray(message) ? message[0] : message;
    }
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

export {translatableTextPropTypes, translate, translateLocal, translateIfPhraseKey, formatList, formatMessageElementList, getDevicePreferredLocale};
export type {PhraseParameters, Phrase, MaybePhraseKey};
