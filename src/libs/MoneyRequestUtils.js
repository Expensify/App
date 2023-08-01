import lodashGet from 'lodash/get';
import _ from 'underscore';
import CONST from '../CONST';

/**
 * Returns the new selection object based on the updated amount's length
 *
 * @param {Object} oldSelection
 * @param {Number} prevLength
 * @param {Number} newLength
 * @returns {Object}
 */
const getNewSelection = (oldSelection, prevLength, newLength) => {
    const cursorPosition = oldSelection.end + (newLength - prevLength);
    return {start: cursorPosition, end: cursorPosition};
};

/**
 * Strip comma from the amount
 *
 * @param {String} newAmount
 * @returns {String}
 */
const stripCommaFromAmount = (newAmount) => newAmount.replace(/,/g, '');

/**
 * Strip spaces from the amount
 *
 * @param {String} newAmount
 * @returns {String}
 */
const stripSpacesFromAmount = (newAmount) => newAmount.replace(/\s+/g, '');

/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param {String} newAmount - Changed amount from user input
 * @returns {String}
 */
const addLeadingZero = (newAmount) => (newAmount === '.' ? '0.' : newAmount);

/**
 * Calculate the length of the amount with leading zeroes
 *
 * @param {String} newAmount
 * @returns {Number}
 */
const calculateAmountLength = (newAmount) => {
    const leadingZeroes = newAmount.match(/^0+/);
    const leadingZeroesLength = lodashGet(leadingZeroes, '[0].length', 0);
    const absAmount = parseFloat((stripCommaFromAmount(newAmount) * 100).toFixed(2)).toString();

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
 * @param {String} newAmount
 * @returns {Boolean}
 */
const validateAmount = (newAmount) => {
    const decimalNumberRegex = new RegExp(/^\d+(,\d+)*(\.\d{0,2})?$/, 'i');
    return newAmount === '' || (decimalNumberRegex.test(newAmount) && calculateAmountLength(newAmount) <= CONST.IOU.AMOUNT_MAX_LENGTH);
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

export {getNewSelection, stripCommaFromAmount, stripSpacesFromAmount, addLeadingZero, validateAmount, replaceAllDigits};
