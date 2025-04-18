"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getDevicePreferredLocale = exports.formatMessageElementList = exports.formatList = exports.translateLocal = exports.translate = void 0;
var RNLocalize = require("react-native-localize");
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var memoize_1 = require("@libs/memoize");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var translations_1 = require("@src/languages/translations");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var LocaleListener_1 = require("./LocaleListener");
var BaseLocaleListener_1 = require("./LocaleListener/BaseLocaleListener");
// Current user mail is needed for handling missing translations
var userEmail = '';
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].SESSION,
    callback: function (val) {
        var _a;
        if (!val) {
            return;
        }
        userEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
    }
});
// Listener when an update in Onyx happens so we use the updated locale when translating/localizing items.
LocaleListener_1["default"].connect();
// Note: This has to be initialized inside a function and not at the top level of the file, because Intl is polyfilled,
// and if React Native executes this code upon import, then the polyfill will not be available yet and it will barf
var CONJUNCTION_LIST_FORMATS_FOR_LOCALES;
function init() {
    CONJUNCTION_LIST_FORMATS_FOR_LOCALES = Object.values(CONST_1["default"].LOCALES).reduce(function (memo, locale) {
        // This is not a supported locale, so we'll use ES_ES instead
        if (locale === CONST_1["default"].LOCALES.ES_ES_ONFIDO) {
            // eslint-disable-next-line no-param-reassign
            memo[locale] = new Intl.ListFormat(CONST_1["default"].LOCALES.ES_ES, { style: 'long', type: 'conjunction' });
            return memo;
        }
        // eslint-disable-next-line no-param-reassign
        memo[locale] = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
        return memo;
    }, {});
}
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
function getTranslatedPhrase(language, phraseKey, fallbackLanguage) {
    var _a;
    var parameters = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        parameters[_i - 3] = arguments[_i];
    }
    var translatedPhrase = (_a = translations_1["default"] === null || translations_1["default"] === void 0 ? void 0 : translations_1["default"][language]) === null || _a === void 0 ? void 0 : _a[phraseKey];
    if (translatedPhrase) {
        if (typeof translatedPhrase === 'function') {
            /**
             * If the result of `translatedPhrase` is an object, check if it contains the 'count' parameter
             * to handle pluralization logic.
             * Alternatively, before evaluating the translated result, we can check if the 'count' parameter
             * exists in the passed parameters.
             */
            var translateFunction = translatedPhrase;
            var translateResult = translateFunction.apply(void 0, parameters);
            if (typeof translateResult === 'string') {
                return translateResult;
            }
            var phraseObject = parameters[0];
            if (typeof (phraseObject === null || phraseObject === void 0 ? void 0 : phraseObject.count) !== 'number') {
                throw new Error("Invalid plural form for '" + phraseKey + "'");
            }
            var pluralRule = new Intl.PluralRules(language).select(phraseObject.count);
            var pluralResult = translateResult[pluralRule];
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
        return translatedPhrase;
    }
    if (!fallbackLanguage) {
        return null;
    }
    // Phrase is not found in full locale, search it in fallback language e.g. es
    var fallbackTranslatedPhrase = getTranslatedPhrase.apply(void 0, __spreadArrays([fallbackLanguage, phraseKey, null], parameters));
    if (fallbackTranslatedPhrase) {
        return fallbackTranslatedPhrase;
    }
    if (fallbackLanguage !== CONST_1["default"].LOCALES.DEFAULT) {
        Log_1["default"].alert(phraseKey + " was not found in the " + fallbackLanguage + " locale");
    }
    // Phrase is not translated, search it in default language (en)
    return getTranslatedPhrase.apply(void 0, __spreadArrays([CONST_1["default"].LOCALES.DEFAULT, phraseKey, null], parameters));
}
var memoizedGetTranslatedPhrase = memoize_1["default"](getTranslatedPhrase, {
    maxArgs: 2,
    equality: 'shallow',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    skipCache: function (params) { return !EmptyObject_1.isEmptyObject(params.at(3)); }
});
/**
 * Return translated string for given locale and phrase
 *
 * @param [desiredLanguage] eg 'en', 'es-ES'
 * @param [parameters] Parameters to supply if the phrase is a template literal.
 */
function translate(desiredLanguage, path) {
    var parameters = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        parameters[_i - 2] = arguments[_i];
    }
    // Search phrase in full locale e.g. es-ES
    var language = desiredLanguage === CONST_1["default"].LOCALES.ES_ES_ONFIDO ? CONST_1["default"].LOCALES.ES_ES : desiredLanguage;
    // Phrase is not found in full locale, search it in fallback language e.g. es
    var languageAbbreviation = desiredLanguage.substring(0, 2);
    var translatedPhrase = memoizedGetTranslatedPhrase.apply(void 0, __spreadArrays([language, path, languageAbbreviation], parameters));
    if (translatedPhrase !== null && translatedPhrase !== undefined) {
        return translatedPhrase;
    }
    // Phrase is not found in default language, on production and staging log an alert to server
    // on development throw an error
    if (CONFIG_1["default"].IS_IN_PRODUCTION || CONFIG_1["default"].IS_IN_STAGING) {
        var phraseString = Array.isArray(path) ? path.join('.') : path;
        Log_1["default"].alert(phraseString + " was not found in the en locale");
        if (userEmail.includes(CONST_1["default"].EMAIL.EXPENSIFY_EMAIL_DOMAIN)) {
            return CONST_1["default"].MISSING_TRANSLATION;
        }
        return phraseString;
    }
    throw new Error(path + " was not found in the default language");
}
exports.translate = translate;
/**
 * Uses the locale in this file updated by the Onyx subscriber.
 */
function translateLocal(phrase) {
    var parameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parameters[_i - 1] = arguments[_i];
    }
    return translate.apply(void 0, __spreadArrays([BaseLocaleListener_1["default"].getPreferredLocale(), phrase], parameters));
}
exports.translateLocal = translateLocal;
function getPreferredListFormat() {
    if (!CONJUNCTION_LIST_FORMATS_FOR_LOCALES) {
        init();
    }
    return CONJUNCTION_LIST_FORMATS_FOR_LOCALES[BaseLocaleListener_1["default"].getPreferredLocale()];
}
/**
 * Format an array into a string with comma and "and" ("a dog, a cat and a chicken")
 */
function formatList(components) {
    var listFormat = getPreferredListFormat();
    return listFormat.format(components);
}
exports.formatList = formatList;
function formatMessageElementList(elements) {
    var listFormat = getPreferredListFormat();
    var parts = listFormat.formatToParts(elements.map(function (e) { return e.content; }));
    var resultElements = [];
    var nextElementIndex = 0;
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part.type === 'element') {
            /**
             * The standard guarantees that all input elements will be present in the constructed parts, each exactly
             * once, and without any modifications: https://tc39.es/ecma402/#sec-createpartsfromlist
             */
            var element = elements[nextElementIndex++];
            resultElements.push(element);
        }
        else {
            var literalElement = {
                kind: 'text',
                content: part.value
            };
            resultElements.push(literalElement);
        }
    }
    return resultElements;
}
exports.formatMessageElementList = formatMessageElementList;
/**
 * Returns the user device's preferred language.
 */
function getDevicePreferredLocale() {
    var _a, _b;
    return (_b = (_a = RNLocalize.findBestAvailableLanguage([CONST_1["default"].LOCALES.EN, CONST_1["default"].LOCALES.ES])) === null || _a === void 0 ? void 0 : _a.languageTag) !== null && _b !== void 0 ? _b : CONST_1["default"].LOCALES.DEFAULT;
}
exports.getDevicePreferredLocale = getDevicePreferredLocale;
