import type {TranslationPaths} from '@src/languages/types';
import type Locale from '@src/types/onyx/Locale';
import {translate} from './Localize';
import memoize from './memoize';
import {format, formatToParts} from './NumberFormatUtils';

const STANDARD_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', ','];

const INDEX_DECIMAL = 10;
const INDEX_MINUS_SIGN = 11;
const INDEX_GROUP = 12;

const getLocaleDigits = memoize(
    (locale: Locale | undefined): string[] => {
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
function toLocaleDigit(locale: Locale | undefined, digit: string): string {
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
function fromLocaleDigit(locale: Locale | undefined, localeDigit: string): string {
    const index = getLocaleDigits(locale).indexOf(localeDigit);
    if (index < 0) {
        throw new Error(`"${localeDigit}" must be in ${JSON.stringify(getLocaleDigits(locale))}`);
    }
    return STANDARD_DIGITS.at(index) ?? '';
}

/**
 * Formats a number into its localized ordinal representation i.e 1st, 2nd etc
 * @param locale - The locale to use for formatting
 * @param number - The number to format
 * @param writtenOrdinals - If true, returns the written ordinal (e.g. "first", "second") for numbers 1-10
 */
function toLocaleOrdinal(locale: Locale | undefined, number: number, writtenOrdinals = false): string {
    // Defaults to "other" suffix or "th" in English
    let suffixKey: TranslationPaths = 'workflowsPage.frequencies.ordinals.other';

    // Calculate last digit of the number to determine basic ordinality
    const lastDigit = number % 10;

    // Calculate last two digits to handle exceptions in the 11-13 range
    const lastTwoDigits = number % 100;

    if (writtenOrdinals && number >= 1 && number <= 10) {
        return translate(locale, `workflowsPage.frequencies.ordinals.${number}` as TranslationPaths);
    }

    if (lastDigit === 1 && lastTwoDigits !== 11) {
        suffixKey = 'workflowsPage.frequencies.ordinals.one';
    } else if (lastDigit === 2 && lastTwoDigits !== 12) {
        suffixKey = 'workflowsPage.frequencies.ordinals.two';
    } else if (lastDigit === 3 && lastTwoDigits !== 13) {
        suffixKey = 'workflowsPage.frequencies.ordinals.few';
    }

    const suffix = translate(locale, suffixKey);

    return `${number}${suffix}`;
}

export {toLocaleDigit, toLocaleOrdinal, fromLocaleDigit};
