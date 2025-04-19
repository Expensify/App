'use strict';
exports.__esModule = true;
exports.validatePercentage =
    exports.validateAmount =
    exports.replaceCommasWithPeriod =
    exports.stripSpacesFromAmount =
    exports.stripDecimalsFromAmount =
    exports.stripCommaFromAmount =
    exports.replaceAllDigits =
    exports.isScanRequest =
    exports.isDistanceRequest =
    exports.addLeadingZero =
        void 0;
var CONST_1 = require('@src/CONST');
/**
 * Strip comma from the amount
 */
function stripCommaFromAmount(amount) {
    return amount.replace(/,/g, '');
}
exports.stripCommaFromAmount = stripCommaFromAmount;
/**
 * Strip spaces from the amount
 */
function stripSpacesFromAmount(amount) {
    return amount.replace(/\s+/g, '');
}
exports.stripSpacesFromAmount = stripSpacesFromAmount;
function replaceCommasWithPeriod(amount) {
    return amount.replace(/,+/g, '.');
}
exports.replaceCommasWithPeriod = replaceCommasWithPeriod;
/**
 * Strip decimals from the amount
 */
function stripDecimalsFromAmount(amount) {
    return amount.replace(/\.\d*$/, '');
}
exports.stripDecimalsFromAmount = stripDecimalsFromAmount;
/**
 * Adds a leading zero to the amount if user entered just the decimal separator
 *
 * @param amount - Changed amount from user input
 * @param shouldAllowNegative - Should allow negative numbers
 */
function addLeadingZero(amount, shouldAllowNegative) {
    if (shouldAllowNegative === void 0) {
        shouldAllowNegative = false;
    }
    if (shouldAllowNegative && amount.startsWith('-.')) {
        return '-0' + amount;
    }
    return amount.startsWith('.') ? '0' + amount : amount;
}
exports.addLeadingZero = addLeadingZero;
/**
 * Check if amount is a decimal up to 3 digits
 */
function validateAmount(amount, decimals, amountMaxLength, shouldAllowNegative) {
    if (amountMaxLength === void 0) {
        amountMaxLength = CONST_1['default'].IOU.AMOUNT_MAX_LENGTH;
    }
    if (shouldAllowNegative === void 0) {
        shouldAllowNegative = false;
    }
    var regexString =
        decimals === 0
            ? '^' + (shouldAllowNegative ? '-?' : '') + '\\d{1,' + amountMaxLength + '}$' // Don't allow decimal point if decimals === 0
            : '^' + (shouldAllowNegative ? '-?' : '') + '\\d{1,' + amountMaxLength + '}(\\.\\d{0,' + decimals + '})?$'; // Allow the decimal point and the desired number of digits after the point
    var decimalNumberRegex = new RegExp(regexString, 'i');
    if (shouldAllowNegative) {
        return amount === '' || amount === '-' || decimalNumberRegex.test(amount);
    }
    return amount === '' || decimalNumberRegex.test(amount);
}
exports.validateAmount = validateAmount;
/**
 * Check if percentage is between 0 and 100
 */
function validatePercentage(amount) {
    var regexString = '^(100|[0-9]{1,2})$';
    var percentageRegex = new RegExp(regexString, 'i');
    return amount === '' || percentageRegex.test(amount);
}
exports.validatePercentage = validatePercentage;
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
            } catch (_a) {
                return char;
            }
        })
        .join('');
}
exports.replaceAllDigits = replaceAllDigits;
/**
 * Check if distance expense or not
 */
function isDistanceRequest(iouType, selectedTab) {
    return (iouType === CONST_1['default'].IOU.TYPE.REQUEST || iouType === CONST_1['default'].IOU.TYPE.SUBMIT) && selectedTab === CONST_1['default'].TAB_REQUEST.DISTANCE;
}
exports.isDistanceRequest = isDistanceRequest;
/**
 * Check if scan expense or not
 */
function isScanRequest(selectedTab) {
    return selectedTab === CONST_1['default'].TAB_REQUEST.SCAN;
}
exports.isScanRequest = isScanRequest;
