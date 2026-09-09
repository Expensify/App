/**
 * Separate from `localeOrdinalMap` because a date is not a rank: Japanese dates read `15日` where the rank is `第15`.
 * Each entry renders the day alone. Any surrounding preposition or unit belongs to the sentence in `<locale>.ts`.
 */
import type {Locale} from '@src/CONST/LOCALES';
import {LOCALES} from '@src/CONST/LOCALES';

type DayOfMonthRenderer = (day: number) => string;

const localeDayOfMonthMap: Record<Locale, DayOfMonthRenderer> = {
    /** English is the only locale here whose dates take an ordinal suffix, and it varies by digit. */
    [LOCALES.EN]: (day) => {
        const lastTwo = day % 100;
        if (lastTwo >= 11 && lastTwo <= 13) {
            return `${day}th`;
        }
        switch (day % 10) {
            case 1:
                return `${day}st`;
            case 2:
                return `${day}nd`;
            case 3:
                return `${day}rd`;
            default:
                return `${day}th`;
        }
    },
    /** Cardinal except the first, like the other Romance locales here: `el 1.º`, then `el 2`, `el 15`. */
    [LOCALES.ES]: (day) => (day === 1 ? '1.º' : `${day}`),
    /** Only the first of the month takes an ordinal in French: `le 1er`, then `le 2`, `le 15`. */
    [LOCALES.FR]: (day) => (day === 1 ? '1er' : `${day}`),
    /** German dates take a trailing period. */
    [LOCALES.DE]: (day) => `${day}.`,
    /** Cardinal except the first: `1η`, then `2`, `15`. */
    [LOCALES.EL]: (day) => (day === 1 ? '1η' : `${day}`),
    /** Same first-of-month rule as French: `il 1º`, then `il 2`, `il 15`. A bare `15º` would be the rank, not the date. */
    [LOCALES.IT]: (day) => (day === 1 ? '1º' : `${day}`),
    /** CJK dates carry the day unit, where the ordinal would be the `第15` prefix. */
    [LOCALES.JA]: (day) => `${day}日`,
    [LOCALES.NL]: (day) => `${day}e`,
    /** Polish dates take a trailing period, as the locale's own `1. i 16. dnia każdego miesiąca` string shows. */
    [LOCALES.PL]: (day) => `${day}.`,
    /** Cardinal except the first: `dia 1º`, then `dia 2`, `dia 15`. */
    [LOCALES.PT_BR]: (day) => (day === 1 ? '1º' : `${day}`),
    [LOCALES.ZH_HANS]: (day) => `${day}日`,
};

export default localeDayOfMonthMap;
