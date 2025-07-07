"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = translate;
exports.translateLocal = translateLocal;
exports.formatList = formatList;
exports.formatMessageElementList = formatMessageElementList;
exports.getDevicePreferredLocale = getDevicePreferredLocale;
var RNLocalize = require("react-native-localize");
var react_native_onyx_1 = require("react-native-onyx");
var Log_1 = require("@libs/Log");
var memoize_1 = require("@libs/memoize");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
// Current user mail is needed for handling missing translations
var userEmail = '';
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        var _a;
        if (!val) {
            return;
        }
        userEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
    },
});
// Note: This has to be initialized inside a function and not at the top level of the file, because Intl is polyfilled,
// and if React Native executes this code upon import, then the polyfill will not be available yet and it will barf
var CONJUNCTION_LIST_FORMATS_FOR_LOCALES;
function init() {
    CONJUNCTION_LIST_FORMATS_FOR_LOCALES = Object.values(CONST_1.default.LOCALES).reduce(function (memo, locale) {
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
function getTranslatedPhrase(language, phraseKey) {
    var parameters = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        parameters[_i - 2] = arguments[_i];
    }
    var translatedPhrase = IntlStore_1.default.get(phraseKey, language);
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
                throw new Error("Invalid plural form for '".concat(phraseKey, "'"));
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
    Log_1.default.alert("".concat(phraseKey, " was not found in the ").concat(language, " locale"));
    return null;
}
var memoizedGetTranslatedPhrase = (0, memoize_1.default)(getTranslatedPhrase, {
    maxArgs: 2,
    equality: 'shallow',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    skipCache: function (params) { return !(0, EmptyObject_1.isEmptyObject)(params.at(2)); },
});
/**
 * Return translated string for given locale and phrase
 *
 * @param [locale] eg 'en', 'es'
 * @param [parameters] Parameters to supply if the phrase is a template literal.
 */
function translate(locale, path) {
    var parameters = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        parameters[_i - 2] = arguments[_i];
    }
    if (!locale) {
        // If no language is provided, return the path as is
        return Array.isArray(path) ? path.join('.') : path;
    }
    var translatedPhrase = memoizedGetTranslatedPhrase.apply(void 0, __spreadArray([locale, path], parameters, false));
    if (translatedPhrase !== null && translatedPhrase !== undefined) {
        return translatedPhrase;
    }
    // Phrase is not found in default language, on production and staging log an alert to server
    // on development throw an error
    if (CONFIG_1.default.IS_IN_PRODUCTION || CONFIG_1.default.IS_IN_STAGING) {
        var phraseString = Array.isArray(path) ? path.join('.') : path;
        Log_1.default.alert("".concat(phraseString, " was not found in the ").concat(locale, " locale"));
        if (userEmail.includes(CONST_1.default.EMAIL.EXPENSIFY_EMAIL_DOMAIN)) {
            return CONST_1.default.MISSING_TRANSLATION;
        }
        return phraseString;
    }
    throw new Error("".concat(path, " was not found in the ").concat(locale, " locale"));
}
/**
 * Uses the locale in this file updated by the Onyx subscriber.
 */
function translateLocal(phrase) {
    var parameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parameters[_i - 1] = arguments[_i];
    }
    var currentLocale = IntlStore_1.default.getCurrentLocale();
    return translate.apply(void 0, __spreadArray([currentLocale, phrase], parameters, false));
}
function getPreferredListFormat() {
    var _a;
    if (!CONJUNCTION_LIST_FORMATS_FOR_LOCALES) {
        init();
    }
    return CONJUNCTION_LIST_FORMATS_FOR_LOCALES[(_a = IntlStore_1.default.getCurrentLocale()) !== null && _a !== void 0 ? _a : CONST_1.default.LOCALES.DEFAULT];
}
/**
 * Format an array into a string with comma and "and" ("a dog, a cat and a chicken")
 */
function formatList(components) {
    var listFormat = getPreferredListFormat();
    return listFormat.format(components);
}
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
function getDevicePreferredLocale() {
    var _a, _b;
    return (_b = (_a = RNLocalize.findBestAvailableLanguage(Object.values(CONST_1.default.LOCALES))) === null || _a === void 0 ? void 0 : _a.languageTag) !== null && _b !== void 0 ? _b : CONST_1.default.LOCALES.DEFAULT;
}
