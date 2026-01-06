import type {ValueOf} from 'type-fest';

/**
 * These locales are fully supported.
 */
const FULLY_SUPPORTED_LOCALES = {
    EN: 'en',
    ES: 'es',
} as const;

/**
 * These are newly-added locales that aren't yet fully supported. i.e:
 *
 * - No emoji keyword support
 * - Unaudited translations
 */
const BETA_LOCALES = {
    DE: 'de',
    FR: 'fr',
    IT: 'it',
    JA: 'ja',
    NL: 'nl',
    PL: 'pl',
    PT_BR: 'pt-BR',
    ZH_HANS: 'zh-hans',
} as const;

/**
 * These are additional locales that are not valid values of the preferredLocale NVP.
 */
const EXTENDED_LOCALES = {
    ES_ES_ONFIDO: 'es_ES',
} as const;

/**
 * Locales that are valid values of the preferredLocale NVP.
 */
const LOCALES = {
    DEFAULT: FULLY_SUPPORTED_LOCALES.EN,
    ...FULLY_SUPPORTED_LOCALES,
    ...BETA_LOCALES,
} as const;

/**
 * Locales that are valid translation targets. This does not include English, because it's used as the source of truth.
 */
const {DEFAULT, EN, ...TRANSLATION_TARGET_LOCALES} = {...LOCALES} as const;

/**
 * These strings are never translated.
 */
const LOCALE_TO_LANGUAGE_STRING = {
    [FULLY_SUPPORTED_LOCALES.EN]: 'English',
    [FULLY_SUPPORTED_LOCALES.ES]: 'Español',
    [BETA_LOCALES.DE]: 'Deutsch',
    [BETA_LOCALES.FR]: 'Français',
    [BETA_LOCALES.IT]: 'Italiano',
    [BETA_LOCALES.JA]: '日本語',
    [BETA_LOCALES.NL]: 'Nederlands',
    [BETA_LOCALES.PL]: 'Polski',
    [BETA_LOCALES.PT_BR]: 'Português (BR)',
    [BETA_LOCALES.ZH_HANS]: '中文 (简体)',
} as const;

type FullySupportedLocale = ValueOf<typeof FULLY_SUPPORTED_LOCALES>;
type Locale = FullySupportedLocale | ValueOf<typeof BETA_LOCALES>;
type TranslationTargetLocale = ValueOf<typeof TRANSLATION_TARGET_LOCALES>;

// Sort all locales alphabetically by their display names
// eslint-disable-next-line rulesdir/prefer-locale-compare-from-context
const SORTED_LOCALES = Object.values({...FULLY_SUPPORTED_LOCALES, ...BETA_LOCALES}).sort((a, b) => LOCALE_TO_LANGUAGE_STRING[a].localeCompare(LOCALE_TO_LANGUAGE_STRING[b]));

function isSupportedLocale(locale: string): locale is Locale {
    return (Object.values(LOCALES) as readonly string[]).includes(locale);
}

function isFullySupportedLocale(locale: Locale): locale is FullySupportedLocale {
    return (Object.values(FULLY_SUPPORTED_LOCALES) as Locale[]).includes(locale);
}

function isTranslationTargetLocale(locale: string): locale is TranslationTargetLocale {
    return (Object.values(TRANSLATION_TARGET_LOCALES) as readonly string[]).includes(locale);
}

export {
    BETA_LOCALES,
    EXTENDED_LOCALES,
    FULLY_SUPPORTED_LOCALES,
    LOCALES,
    LOCALE_TO_LANGUAGE_STRING,
    SORTED_LOCALES,
    TRANSLATION_TARGET_LOCALES,
    isSupportedLocale,
    isFullySupportedLocale,
    isTranslationTargetLocale,
};
export type {FullySupportedLocale, Locale, TranslationTargetLocale};
