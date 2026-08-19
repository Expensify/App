import localeDayOfMonthMap from '@src/languages/localeDayOfMonthMap';
import localeOrdinalMap from '@src/languages/localeOrdinalMap';
import type Locale from '@src/types/onyx/Locale';

import memoize from './memoize';
import {format, formatToParts} from './NumberFormatUtils';

const STANDARD_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', ','];

const INDEX_DECIMAL = 10;
const INDEX_MINUS_SIGN = 11;
const INDEX_GROUP = 12;

const getLocaleDigits = memoize(
    (locale: Locale): string[] => {
        const localeDigits = [...STANDARD_DIGITS];
        for (let i = 0; i <= 9; i++) {
            localeDigits[i] = format(locale, i);
        }
        for (const part of formatToParts(locale, 1000000.5)) {
            switch (part.type) {
                case 'decimal':
                    localeDigits[INDEX_DECIMAL] = part.value;
                    break;
                case 'minusSign':
                    localeDigits[INDEX_MINUS_SIGN] = part.value;
                    break;
                case 'group':
                    localeDigits[INDEX_GROUP] = part.value;
                    break;
                default:
                    break;
            }
        }
        return localeDigits;
    },
    {monitoringName: 'getLocaleDigits'},
);

/**
 * Gets the locale digit corresponding to a standard digit.
 *
 * @param digit - Character of a single standard digit . It may be "0" ~ "9" (digits),
 * "," (group separator), "." (decimal separator) or "-" (minus sign).
 *
 * @throws If `digit` is not a valid standard digit.
 */
function toLocaleDigit(locale: Locale, digit: string): string {
    const index = STANDARD_DIGITS.indexOf(digit);
    if (index < 0) {
        throw new Error(`"${digit}" must be in ${JSON.stringify(STANDARD_DIGITS)}`);
    }
    return getLocaleDigits(locale).at(index) ?? '';
}

/**
 * Gets the standard digit corresponding to a locale digit.
 *
 * @param localeDigit - Character of a single locale digit. It may be **the localized version** of
 * "0" ~ "9" (digits), "," (group separator), "." (decimal separator) or "-" (minus sign).
 *
 * @throws If `localeDigit` is not a valid locale digit.
 */
function fromLocaleDigit(locale: Locale, localeDigit: string): string {
    const index = getLocaleDigits(locale).indexOf(localeDigit);
    if (index < 0) {
        throw new Error(`"${localeDigit}" must be in ${JSON.stringify(getLocaleDigits(locale))}`);
    }
    return STANDARD_DIGITS.at(index) ?? '';
}

// Constructing Intl.PluralRules is expensive, and this runs once per row in lists,
// so the instance is cached per locale.
const createOrdinalPluralRules = (locale: Locale): Intl.PluralRules => new Intl.PluralRules(locale, {type: 'ordinal'});
const memoizedCreateOrdinalPluralRules = memoize(createOrdinalPluralRules);

/**
 * Formats a number into its localized ordinal representation, e.g. `1st` in English, `1.` in German
 * or `第1` in Japanese. Returns an empty string for a non-finite number, because callers commonly pass
 * `Date` getters and `PluralRules.select(NaN)` resolves to 'other' rather than throwing, which renders "NaNth".
 *
 * @param locale - The locale to use for formatting
 * @param number - The number to format
 */
function toLocaleOrdinal(locale: Locale, number: number): string {
    if (!Number.isFinite(number)) {
        return '';
    }
    // Ordinal rules vary far more than they appear to: English selects four categories, Italian two,
    // and most locales only ever select `other`. Asking Intl avoids reimplementing English's rule and
    // applying it everywhere.
    const pluralRule = memoizedCreateOrdinalPluralRules(locale).select(number);
    const localeOrdinalRules = localeOrdinalMap[locale];

    // Each locale declares only the categories it needs, so the selected one may be missing.
    const rule = localeOrdinalRules[pluralRule] ?? localeOrdinalRules.other;
    return rule(number);
}

/**
 * Renders a calendar day of the month for the locale. Separate from `toLocaleOrdinal`, which renders a rank: Japanese
 * dates read `15日` where the rank reads `第15`, and Italian and Polish dates are cardinal where their ranks are not.
 */
function toLocaleDayOfMonth(locale: Locale, day: number): string {
    if (!Number.isFinite(day)) {
        return '';
    }
    return localeDayOfMonthMap[locale](day);
}

export {toLocaleDigit, toLocaleOrdinal, toLocaleDayOfMonth, fromLocaleDigit};
