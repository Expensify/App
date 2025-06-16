import type {Spread, TupleToUnion} from 'type-fest';

const LOCALES = {
    EN: 'en',
    ES: 'es',
    ES_ES: 'es-ES',
    ES_ES_ONFIDO: 'es_ES',

    DEFAULT: 'en',
} as const;

const UPCOMING_LOCALES = {
    DE: 'de',
    FR: 'fr',
    IT: 'it',
    JA: 'ja',
    NL: 'nl',
    PL: 'pl',
    PT_BR: 'pt-BR',
    ZH_HANS: 'zh-hans',
};

const LANGUAGES = [LOCALES.EN, LOCALES.ES] as const;

const UPCOMING_LANGUAGES = [
    UPCOMING_LOCALES.DE,
    UPCOMING_LOCALES.FR,
    UPCOMING_LOCALES.IT,
    UPCOMING_LOCALES.JA,
    UPCOMING_LOCALES.NL,
    UPCOMING_LOCALES.PL,
    UPCOMING_LOCALES.PT_BR,
    UPCOMING_LOCALES.ZH_HANS,
] as const;

const LOCALE_TO_LANGUAGE_STRING = {
    [LOCALES.EN]: 'English',
    [LOCALES.ES]: 'Español',
    [UPCOMING_LOCALES.DE]: 'Deutsch',
    [UPCOMING_LOCALES.FR]: 'Français',
    [UPCOMING_LOCALES.IT]: 'Italiano',
    [UPCOMING_LOCALES.JA]: '日本語',
    [UPCOMING_LOCALES.NL]: 'Nederlands',
    [UPCOMING_LOCALES.PL]: 'Polski',
    [UPCOMING_LOCALES.PT_BR]: 'Português (BR)',
    [UPCOMING_LOCALES.ZH_HANS]: '中文 (简体)',
} as const;

type SupportedLanguage = TupleToUnion<Spread<typeof LANGUAGES, typeof UPCOMING_LANGUAGES>>;

/**
 * We can translate into any language but English (which is used as the source language).
 */
type TranslationTargetLanguage = Exclude<SupportedLanguage, typeof LOCALES.EN>;

export {LOCALES, LANGUAGES, UPCOMING_LANGUAGES, LOCALE_TO_LANGUAGE_STRING};
export type {SupportedLanguage, TranslationTargetLanguage};
