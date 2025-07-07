"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLeadingZero = addLeadingZero;
exports.replaceAllDigits = replaceAllDigits;
exports.stripCommaFromAmount = stripCommaFromAmount;
exports.stripDecimalsFromAmount = stripDecimalsFromAmount;
exports.stripSpacesFromAmount = stripSpacesFromAmount;
exports.replaceCommasWithPeriod = replaceCommasWithPeriod;
exports.validateAmount = validateAmount;
exports.validatePercentage = validatePercentage;
var CONST_1 = require("@src/CONST");
/**
 * Strip comma from the amount
 */
function stripCommaFromAmount(amount) {
    return amount.replace(/,/g, '');
}
/**
 * Strip spaces from the amount
 */
function stripSpacesFromAmount(amount) {
    return amount.replace(/\s+/g, '');
}
function replaceCommasWithPeriod(amount) {
    return amount.replace(/,+/g, '.');
}
/**
 * Strip decimals from the amount
 */
function stripDecimalsFromAmount(amount) {
    return amount.replace(/\.\d*$/, '');
}
/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param amount - Changed amount from user input
 * @param shouldAllowNegative - Should allow negative numbers
 */
function addLeadingZero(amount, shouldAllowNegative) {
    if (shouldAllowNegative === void 0) { shouldAllowNegative = false; }
    if (shouldAllowNegative && amount.startsWith('-.')) {
        return "-0".concat(amount);
    }
    return amount.startsWith('.') ? "0".concat(amount) : amount;
}
/**
 * Check if amount is a decimal up to 3 digits
 */
function validateAmount(amount, decimals, amountMaxLength, shouldAllowNegative) {
    if (amountMaxLength === void 0) { amountMaxLength = CONST_1.default.IOU.AMOUNT_MAX_LENGTH; }
    if (shouldAllowNegative === void 0) { shouldAllowNegative = false; }
    var regexString = decimals === 0
        ? "^".concat(shouldAllowNegative ? '-?' : '', "\\d{1,").concat(amountMaxLength, "}$") // Don't allow decimal point if decimals === 0
        : "^".concat(shouldAllowNegative ? '-?' : '', "\\d{1,").concat(amountMaxLength, "}(\\.\\d{0,").concat(decimals, "})?$"); // Allow the decimal point and the desired number of digits after the point
    var decimalNumberRegex = new RegExp(regexString, 'i');
    if (shouldAllowNegative) {
        return amount === '' || amount === '-' || decimalNumberRegex.test(amount);
    }
    return amount === '' || decimalNumberRegex.test(amount);
}
/**
 * Check if percentage is between 0 and 100
 */
function validatePercentage(amount) {
    var regexString = '^(100|[0-9]{1,2})$';
    var percentageRegex = new RegExp(regexString, 'i');
    return amount === '' || percentageRegex.test(amount);
}
/**
 * Replaces each character by calling `convertFn`. If `convertFn` throws an error, then
 * the original character will be preserved.
 */
function replaceAllDigits(text, convertFn) {
    return text
        .split('')
        .map(function (char) {
        try {
            return convertFn(char);
        }
        catch (_a) {
            return char;
        }
    })
        .join('');
}
