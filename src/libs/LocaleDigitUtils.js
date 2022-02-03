import _ from 'underscore';

import * as NumberFormatUtils from './NumberFormatUtils';

const STANDARD_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', ','];

const INDEX_DECIMAL = 10;
const INDEX_MINUS_SIGN = 11;
const INDEX_GROUP = 12;

const getLocaleDigits = _.memoize((locale) => {
    const localeDigits = _.clone(STANDARD_DIGITS);
    for (let i = 0; i <= 9; i++) {
        localeDigits[i] = NumberFormatUtils.format(locale, i);
    }
    _.forEach(NumberFormatUtils.formatToParts(locale, 1000000.5), (part) => {
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
    });
    return localeDigits;
});

/**
 * Gets the locale digit corresponding to a standard digit.
 *
 * @param {String} locale
 * @param {String} digit - Character of a single standard digit . It may be "0" ~ "9" (digits),
 * "," (group separator), "." (decimal separator) or "-" (minus sign).
 * @returns {String}
 *
 * @throws If `digit` is not a valid standard digit.
 */
function toLocaleDigit(locale, digit) {
    const index = _.indexOf(STANDARD_DIGITS, digit);
    if (index < 0) {
        throw new Error(`"${digit}" must be in ${JSON.stringify(STANDARD_DIGITS)}`);
    }
    return getLocaleDigits(locale)[index];
}

/**
 * Gets the standard digit corresponding to a locale digit.
 *
 * @param {String} locale
 * @param {String} localeDigit - Character of a single locale digit. It may be **the localized version** of
 * "0" ~ "9" (digits), "," (group separator), "." (decimal separator) or "-" (minus sign).
 * @returns {String}
 *
 * @throws If `localeDigit` is not a valid locale digit.
 */
function fromLocaleDigit(locale, localeDigit) {
    const index = _.indexOf(getLocaleDigits(locale), localeDigit);
    if (index < 0) {
        throw new Error(`"${localeDigit}" must be in ${JSON.stringify(getLocaleDigits(locale))}`);
    }
    return STANDARD_DIGITS[index];
}

export {
    toLocaleDigit,
    fromLocaleDigit,
};
