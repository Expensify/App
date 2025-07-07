"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSLATION_TARGET_LOCALES = exports.SORTED_LOCALES = exports.LOCALE_TO_LANGUAGE_STRING = exports.LOCALES = exports.FULLY_SUPPORTED_LOCALES = exports.EXTENDED_LOCALES = exports.BETA_LOCALES = void 0;
exports.isSupportedLocale = isSupportedLocale;
exports.isFullySupportedLocale = isFullySupportedLocale;
exports.isTranslationTargetLocale = isTranslationTargetLocale;
/**
 * These locales are fully supported.
 */
var FULLY_SUPPORTED_LOCALES = {
    EN: 'en',
    ES: 'es',
};
exports.FULLY_SUPPORTED_LOCALES = FULLY_SUPPORTED_LOCALES;
/**
 * These are newly-added locales that aren't yet fully supported. i.e:
 *
 * - No emoji keyword support
 * - Unaudited translations
 */
var BETA_LOCALES = {
    DE: 'de',
    FR: 'fr',
    IT: 'it',
    JA: 'ja',
    NL: 'nl',
    PL: 'pl',
    PT_BR: 'pt-BR',
    ZH_HANS: 'zh-hans',
};
exports.BETA_LOCALES = BETA_LOCALES;
/**
 * These are additional locales that are not valid values of the preferredLocale NVP.
 */
var EXTENDED_LOCALES = {
    ES_ES_ONFIDO: 'es_ES',
};
exports.EXTENDED_LOCALES = EXTENDED_LOCALES;
/**
 * Locales that are valid values of the preferredLocale NVP.
 */
var LOCALES = __assign(__assign({ DEFAULT: FULLY_SUPPORTED_LOCALES.EN }, FULLY_SUPPORTED_LOCALES), BETA_LOCALES);
exports.LOCALES = LOCALES;
/**
 * Locales that are valid translation targets. This does not include English, because it's used as the source of truth.
 */
var _b = __assign({}, LOCALES), DEFAULT = _b.DEFAULT, EN = _b.EN, TRANSLATION_TARGET_LOCALES = __rest(_b, ["DEFAULT", "EN"]);
exports.TRANSLATION_TARGET_LOCALES = TRANSLATION_TARGET_LOCALES;
/**
 * These strings are never translated.
 */
var LOCALE_TO_LANGUAGE_STRING = (_a = {},
    _a[FULLY_SUPPORTED_LOCALES.EN] = 'English',
    _a[FULLY_SUPPORTED_LOCALES.ES] = 'Español',
    _a[BETA_LOCALES.DE] = 'Deutsch',
    _a[BETA_LOCALES.FR] = 'Français',
    _a[BETA_LOCALES.IT] = 'Italiano',
    _a[BETA_LOCALES.JA] = '日本語',
    _a[BETA_LOCALES.NL] = 'Nederlands',
    _a[BETA_LOCALES.PL] = 'Polski',
    _a[BETA_LOCALES.PT_BR] = 'Português (BR)',
    _a[BETA_LOCALES.ZH_HANS] = '中文 (简体)',
    _a);
exports.LOCALE_TO_LANGUAGE_STRING = LOCALE_TO_LANGUAGE_STRING;
// Sort all locales alphabetically by their display names
var SORTED_LOCALES = Object.values(__assign(__assign({}, FULLY_SUPPORTED_LOCALES), BETA_LOCALES)).sort(function (a, b) { return LOCALE_TO_LANGUAGE_STRING[a].localeCompare(LOCALE_TO_LANGUAGE_STRING[b]); });
exports.SORTED_LOCALES = SORTED_LOCALES;
function isSupportedLocale(locale) {
    return Object.values(LOCALES).includes(locale);
}
function isFullySupportedLocale(locale) {
    return Object.values(FULLY_SUPPORTED_LOCALES).includes(locale);
}
function isTranslationTargetLocale(locale) {
    return Object.values(TRANSLATION_TARGET_LOCALES).includes(locale);
}
