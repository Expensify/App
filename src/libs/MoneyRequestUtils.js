import lodashGet from 'lodash/get';
import _ from 'underscore';
import CONST from '../CONST';

/**
 * Strip comma from the amount
 *
 * @param {String} amount
 * @returns {String}
 */
const stripCommaFromAmount = (amount) => amount.replace(/,/g, '');

/**
 * Strip spaces from the amount
 *
 * @param {String} amount
 * @returns {String}
 */
const stripSpacesFromAmount = (amount) => amount.replace(/\s+/g, '');

/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param {String} amount - Changed amount from user input
 * @returns {String}
 */
const addLeadingZero = (amount) => (amount === '.' ? '0.' : amount);

/**
 * Calculate the length of the amount with leading zeroes
 *
 * @param {String} amount
 * @returns {Number}
 */
const calculateAmountLength = (amount) => {
    const leadingZeroes = amount.match(/^0+/);
    const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
    const absAmount = parseFloat((stripCommaFromAmount(amount) * 100).toFixed(2)).toString();

    // The following logic will prevent users from pasting an amount that is excessively long in length,
    // which would result in the 'absAmount' value being expressed in scientific notation or becoming infinity.
    if (/\D/.test(absAmount)) {
        return CONST.IOU.AMOUNT_MAX_LENGTH + 1;
    }

    // Return the sum of leading zeroes length and absolute amount length (including fraction digits).
    // When the absolute amount is 0, add 2 to the leading zeroes length to represent fraction digits.
    return leadingZeroesLength + (absAmount === '0' ? 2 : absAmount.length);
};

/**
 * Check if amount is a decimal up to 3 digits
 *
 * @param {String} amount
 * @returns {Boolean}
 */
const validateAmount = (amount) => {
    const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
    return amount === '' || (decimalNumberRegex.test(amount) && calculateAmountLength(amount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
};

/**
 * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
 * the original character will be preserved.
 *
 * @param {String} text
 * @param {Function} convertFn - `fromLocaleDigit` or `toLocaleDigit`
 * @returns {String}
 */
const replaceAllDigits = (text, convertFn) =>
    _.chain([...text])
        .map((char) => {
            try {
                return convertFn(char);
            } catch {
                return char;
            }
        })
        .join('')
        .value();

export {stripCommaFromAmount, stripSpacesFromAmount, addLeadingZero, validateAmount, replaceAllDigits};
