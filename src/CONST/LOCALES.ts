import type {Spread, TupleToUnion} from 'type-fest';

const LOCALES = {
    EN: 'en',
    ES: 'es',
    ES_ES: 'es-ES',
    ES_ES_ONFIDO: 'es_ES',

    DEFAULT: 'en',
} as const;

const LANGUAGES = ['en', 'es'] as const;

const UPCOMING_LANGUAGES = ['pr-BR', 'it', 'de', 'fr', 'nl', 'ja', 'zh-hans'] as const;

type SupportedLanguage = TupleToUnion<Spread<typeof LANGUAGES, typeof UPCOMING_LANGUAGES>>;

/**
 * We can translate into any language but English (which is used as the source language).
 */
type TranslationTargetLanguage = Exclude<SupportedLanguage, typeof LOCALES.EN>;

export {LOCALES, LANGUAGES, UPCOMING_LANGUAGES};
export type {SupportedLanguage, TranslationTargetLanguage};
