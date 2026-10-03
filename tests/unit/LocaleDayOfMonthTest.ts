import {toLocaleDayOfMonth} from '@libs/LocaleDigitUtils';

import CONST from '@src/CONST';

/**
 * A calendar day is not a rank. These pin the shape each locale's next-step and settlement templates are written
 * against, so a change here that reads fine in English cannot silently produce `15.. dnia` or `毎月第15に`.
 */
describe('toLocaleDayOfMonth', () => {
    it.each([
        [CONST.LOCALES.EN, '15th'],
        [CONST.LOCALES.ES, '15'],
        [CONST.LOCALES.FR, '15'],
        [CONST.LOCALES.DE, '15.'],
        [CONST.LOCALES.EL, '15'],
        [CONST.LOCALES.IT, '15'],
        [CONST.LOCALES.JA, '15日'],
        [CONST.LOCALES.NL, '15e'],
        [CONST.LOCALES.PL, '15.'],
        [CONST.LOCALES.PT_BR, '15'],
        [CONST.LOCALES.ZH_HANS, '15日'],
    ])('renders day 15 for %s as %s', (locale, expected) => {
        // Given the 15th, a day no locale treats as a special case
        // When it is rendered as a date in the locale
        const rendered = toLocaleDayOfMonth(locale, 15);

        // Then it takes that locale's date form, which its next-step and settlement sentences are written around
        expect(rendered).toBe(expected);
    });

    it.each([
        [1, '1st'],
        [2, '2nd'],
        [3, '3rd'],
        [4, '4th'],
        [11, '11th'],
        [12, '12th'],
        [13, '13th'],
        [21, '21st'],
        [22, '22nd'],
        [23, '23rd'],
        [31, '31st'],
    ])('applies the English teen exception to day %i', (day, expected) => {
        // Given an English day, including the 11th to 13th that break the last-digit rule
        // When it is rendered as a date
        const rendered = toLocaleDayOfMonth(CONST.LOCALES.EN, day);

        // Then it takes the suffix English writes, so the teens read "th" rather than "st", "nd" or "rd"
        expect(rendered).toBe(expected);
    });

    it.each([
        [CONST.LOCALES.FR, '1er', '2'],
        [CONST.LOCALES.IT, '1º', '2'],
        [CONST.LOCALES.ES, '1.º', '2'],
        [CONST.LOCALES.PT_BR, '1º', '2'],
        [CONST.LOCALES.EL, '1η', '2'],
    ])('%s takes an ordinal only on the first of the month', (locale, firstDay, secondDay) => {
        // Given a locale that marks only the first of the month as an ordinal
        // When the first and second of the month are rendered
        const first = toLocaleDayOfMonth(locale, 1);
        const second = toLocaleDayOfMonth(locale, 2);

        // Then only the first carries the marker, as that language writes dates
        expect(first).toBe(firstDay);
        expect(second).toBe(secondDay);
    });

    it('returns empty for a non-finite day rather than rendering NaN', () => {
        // Given a day read from an invalid Date, which is NaN
        // When it is rendered as a date
        const rendered = toLocaleDayOfMonth(CONST.LOCALES.EN, Number.NaN);

        // Then it is empty rather than "NaNth", so a bad date leaves a gap instead of garbage text
        expect(rendered).toBe('');
    });
});
