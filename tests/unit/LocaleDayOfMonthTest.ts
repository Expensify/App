import {toLocaleDayOfMonth} from '@libs/LocaleDigitUtils';

import CONST from '@src/CONST';

/**
 * A calendar day is not a rank. These pin the shape each locale's next-step and settlement templates are written
 * against, so a change here that reads fine in English cannot silently produce `15.. dnia` or `毎月第15に`.
 */
describe('toLocaleDayOfMonth', () => {
    it.each([
        [CONST.LOCALES.EN, '15th'],
        [CONST.LOCALES.ES, '15º'],
        [CONST.LOCALES.FR, '15'],
        [CONST.LOCALES.DE, '15.'],
        [CONST.LOCALES.EL, '15η'],
        [CONST.LOCALES.IT, '15'],
        [CONST.LOCALES.JA, '15日'],
        [CONST.LOCALES.NL, '15e'],
        [CONST.LOCALES.PL, '15'],
        [CONST.LOCALES.PT_BR, '15º'],
        [CONST.LOCALES.ZH_HANS, '15日'],
    ])('renders day 15 for %s as %s', (locale, expected) => {
        expect(toLocaleDayOfMonth(locale, 15)).toBe(expected);
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
        expect(toLocaleDayOfMonth(CONST.LOCALES.EN, day)).toBe(expected);
    });

    it.each([
        [CONST.LOCALES.FR, '1er', '2'],
        [CONST.LOCALES.IT, '1º', '2'],
    ])('%s takes an ordinal only on the first of the month', (locale, firstDay, secondDay) => {
        expect(toLocaleDayOfMonth(locale, 1)).toBe(firstDay);
        expect(toLocaleDayOfMonth(locale, 2)).toBe(secondDay);
    });

    it('returns empty for a non-finite day rather than rendering NaN', () => {
        expect(toLocaleDayOfMonth(CONST.LOCALES.EN, Number.NaN)).toBe('');
    });
});
