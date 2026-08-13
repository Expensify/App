/**
 * Per-locale ordinal rendering, keyed by the CLDR plural category that
 * `Intl.PluralRules(locale, {type: 'ordinal'})` selects for a given number.
 *
 * This lives outside the `src/languages/*.ts` files on purpose. Those are typed as
 * `TranslationDeepObject<typeof en>`, which forces every locale to declare the exact same keys as
 * English. Ordinals do not work that way: English needs four categories, Italian two, and eight of
 * our locales need only `other`. Keeping the data here lets each locale declare exactly the
 * categories its grammar can actually select.
 *
 * Each entry renders the complete string rather than just a suffix, because some locales form
 * ordinals with a prefix (Japanese and Chinese use 第1, not 1第) which a suffix cannot express.
 */
import type {Locale} from '@src/CONST/LOCALES';
import {LOCALES} from '@src/CONST/LOCALES';

/** Renders the full ordinal for a number, e.g. `1st`, `1.`, `第1` */
type OrdinalRenderer = (count: number) => string;

/**
 * `other` is required because it is the fallback for any category a locale does not declare, which
 * keeps a missing entry from producing an empty string.
 */
type LocaleOrdinals = Partial<Record<Intl.LDMLPluralRule, OrdinalRenderer>> & {other: OrdinalRenderer};

const localeOrdinalMap: Record<Locale, LocaleOrdinals> = {
    /** Categories: one, two, few, other. The only locale here needing all four. */
    [LOCALES.EN]: {
        one: (count) => `${count}st`,
        two: (count) => `${count}nd`,
        few: (count) => `${count}rd`,
        other: (count) => `${count}th`,
    },

    /** Categories: other. Uses the masculine ordinal indicator. */
    [LOCALES.ES]: {
        other: (count) => `${count}º`,
    },

    /** Categories: one, other. 1 is written `1er`, everything else takes `e`. */
    [LOCALES.FR]: {
        one: (count) => `${count}er`,
        other: (count) => `${count}e`,
    },

    /** Categories: other. German ordinals are the number followed by a period. */
    [LOCALES.DE]: {
        other: (count) => `${count}.`,
    },

    /**
     * Categories: other.
     *
     * Greek ordinals inflect for gender. `η` is the feminine form, which agrees with the nouns this
     * is currently used for. A different gender would need a different entry, so this is not safe to
     * reuse for arbitrary nouns without revisiting.
     */
    [LOCALES.EL]: {
        other: (count) => `${count}η`,
    },

    /** Categories: many, other. Uses the masculine ordinal indicator. */
    [LOCALES.IT]: {
        many: (count) => `${count}º`,
        other: (count) => `${count}º`,
    },

    /** Categories: other. Japanese forms ordinals with a prefix. */
    [LOCALES.JA]: {
        other: (count) => `第${count}`,
    },

    /** Categories: other. */
    [LOCALES.NL]: {
        other: (count) => `${count}e`,
    },

    /** Categories: other. Polish ordinals are the number followed by a period. */
    [LOCALES.PL]: {
        other: (count) => `${count}.`,
    },

    /** Categories: other. */
    [LOCALES.PT_BR]: {
        other: (count) => `${count}º`,
    },

    /** Categories: other. Chinese forms ordinals with a prefix. */
    [LOCALES.ZH_HANS]: {
        other: (count) => `第${count}`,
    },
};

export default localeOrdinalMap;
