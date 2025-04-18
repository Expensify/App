"use strict";
exports.__esModule = true;
exports.sanitizeCurrencyCode = exports.getCurrency = exports.convertToShortDisplayString = exports.isValidCurrencyCode = exports.convertToDisplayStringWithoutCurrency = exports.convertAmountToDisplayString = exports.convertToDisplayString = exports.convertToFrontendAmountAsString = exports.convertToFrontendAmountAsInteger = exports.convertToBackendAmount = exports.isCurrencySymbolLTR = exports.getCurrencySymbol = exports.getLocalizedCurrencySymbol = exports.getCurrencyUnit = exports.getCurrencyDecimals = void 0;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var BaseLocaleListener_1 = require("./Localize/LocaleListener/BaseLocaleListener");
var NumberFormatUtils_1 = require("./NumberFormatUtils");
var currencyList = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].CURRENCY_LIST,
    callback: function (val) {
        if (!val || Object.keys(val).length === 0) {
            return;
        }
        currencyList = val;
    }
});
/**
 * Returns the number of digits after the decimal separator for a specific currency.
 * For currencies that have decimal places > 2, floor to 2 instead:
 * https://github.com/Expensify/App/issues/15878#issuecomment-1496291464
 *
 * @param currency - IOU currency
 */
function getCurrencyDecimals(currency) {
    var _a;
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var decimals = (_a = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currency]) === null || _a === void 0 ? void 0 : _a.decimals;
    return decimals !== null && decimals !== void 0 ? decimals : 2;
}
exports.getCurrencyDecimals = getCurrencyDecimals;
function getCurrency(currency) {
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var currencyItem = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currency];
    return currencyItem;
}
exports.getCurrency = getCurrency;
/**
 * Returns the currency's minor unit quantity
 * e.g. Cent in USD
 *
 * @param currency - IOU currency
 */
function getCurrencyUnit(currency) {
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    return Math.pow(10, getCurrencyDecimals(currency));
}
exports.getCurrencyUnit = getCurrencyUnit;
/**
 * Get localized currency symbol for currency(ISO 4217) Code
 */
function getLocalizedCurrencySymbol(currencyCode) {
    var _a;
    var parts = NumberFormatUtils_1.formatToParts(BaseLocaleListener_1["default"].getPreferredLocale(), 0, {
        style: 'currency',
        currency: currencyCode
    });
    return (_a = parts.find(function (part) { return part.type === 'currency'; })) === null || _a === void 0 ? void 0 : _a.value;
}
exports.getLocalizedCurrencySymbol = getLocalizedCurrencySymbol;
/**
 * Get the currency symbol for a currency(ISO 4217) Code
 */
function getCurrencySymbol(currencyCode) {
    var _a;
    return (_a = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currencyCode]) === null || _a === void 0 ? void 0 : _a.symbol;
}
exports.getCurrencySymbol = getCurrencySymbol;
/**
 * Whether the currency symbol is left-to-right.
 */
function isCurrencySymbolLTR(currencyCode) {
    var _a;
    var parts = NumberFormatUtils_1.formatToParts(BaseLocaleListener_1["default"].getPreferredLocale(), 0, {
        style: 'currency',
        currency: currencyCode
    });
    // Currency is LTR when the first part is of currency type.
    return ((_a = parts.at(0)) === null || _a === void 0 ? void 0 : _a.type) === 'currency';
}
exports.isCurrencySymbolLTR = isCurrencySymbolLTR;
/**
 * Takes an amount as a floating point number and converts it to an integer equivalent to the amount in "cents".
 * This is because the backend always stores amounts in "cents". The backend works in integer cents to avoid precision errors
 * when doing math operations.
 *
 * @note we do not currently support any currencies with more than two decimal places. Decimal past the second place will be rounded. Sorry Tunisia :(
 */
function convertToBackendAmount(amountAsFloat) {
    return Math.round(amountAsFloat * 100);
}
exports.convertToBackendAmount = convertToBackendAmount;
/**
 * Takes an amount in "cents" as an integer and converts it to a floating point amount used in the frontend.
 *
 * @note we do not support any currencies with more than two decimal places.
 */
function convertToFrontendAmountAsInteger(amountAsInt, currency) {
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var decimals = getCurrencyDecimals(currency);
    return Number((Math.trunc(amountAsInt) / 100.0).toFixed(decimals));
}
exports.convertToFrontendAmountAsInteger = convertToFrontendAmountAsInteger;
/**
 * Takes an amount in "cents" as an integer and converts it to a string amount used in the frontend.
 *
 * @note we do not support any currencies with more than two decimal places.
 */
function convertToFrontendAmountAsString(amountAsInt, currency, withDecimals) {
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    if (withDecimals === void 0) { withDecimals = true; }
    if (amountAsInt === null || amountAsInt === undefined) {
        return '';
    }
    var decimals = withDecimals ? getCurrencyDecimals(currency) : 0;
    return convertToFrontendAmountAsInteger(amountAsInt, currency).toFixed(decimals);
}
exports.convertToFrontendAmountAsString = convertToFrontendAmountAsString;
/**
 * Given an amount in the "cents", convert it to a string for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToDisplayString(amountInCents, currency) {
    if (amountInCents === void 0) { amountInCents = 0; }
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var convertedAmount = convertToFrontendAmountAsInteger(amountInCents, currency);
    /**
     * Fallback currency to USD if it empty string or undefined
     */
    var currencyWithFallback = currency;
    if (!currency) {
        currencyWithFallback = CONST_1["default"].CURRENCY.USD;
    }
    return NumberFormatUtils_1.format(BaseLocaleListener_1["default"].getPreferredLocale(), convertedAmount, {
        style: 'currency',
        currency: currencyWithFallback,
        // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: getCurrencyDecimals(currency),
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2
    });
}
exports.convertToDisplayString = convertToDisplayString;
/**
 * Given the amount in the "cents", convert it to a short string (no decimals) for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToShortDisplayString(amountInCents, currency) {
    if (amountInCents === void 0) { amountInCents = 0; }
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var convertedAmount = convertToFrontendAmountAsInteger(amountInCents, currency);
    return NumberFormatUtils_1.format(BaseLocaleListener_1["default"].getPreferredLocale(), convertedAmount, {
        style: 'currency',
        currency: currency,
        // There will be no decimals displayed (e.g. $9)
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}
exports.convertToShortDisplayString = convertToShortDisplayString;
/**
 * Given an amount, convert it to a string for display in the UI.
 *
 * @param amount – should be a float.
 * @param currency - IOU currency
 */
function convertAmountToDisplayString(amount, currency) {
    if (amount === void 0) { amount = 0; }
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var convertedAmount = amount / 100.0;
    return NumberFormatUtils_1.format(BaseLocaleListener_1["default"].getPreferredLocale(), convertedAmount, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: CONST_1["default"].MIN_TAX_RATE_DECIMAL_PLACES,
        maximumFractionDigits: CONST_1["default"].MAX_TAX_RATE_DECIMAL_PLACES
    });
}
exports.convertAmountToDisplayString = convertAmountToDisplayString;
/**
 * Acts the same as `convertAmountToDisplayString` but the result string does not contain currency
 */
function convertToDisplayStringWithoutCurrency(amountInCents, currency) {
    if (currency === void 0) { currency = CONST_1["default"].CURRENCY.USD; }
    var convertedAmount = convertToFrontendAmountAsInteger(amountInCents, currency);
    return NumberFormatUtils_1.formatToParts(BaseLocaleListener_1["default"].getPreferredLocale(), convertedAmount, {
        style: 'currency',
        currency: currency,
        // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: getCurrencyDecimals(currency),
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2
    })
        .filter(function (x) { return x.type !== 'currency'; })
        .filter(function (x) { return x.type !== 'literal' || x.value.trim().length !== 0; })
        .map(function (x) { return x.value; })
        .join('');
}
exports.convertToDisplayStringWithoutCurrency = convertToDisplayStringWithoutCurrency;
/**
 * Checks if passed currency code is a valid currency based on currency list
 */
function isValidCurrencyCode(currencyCode) {
    var currency = currencyList === null || currencyList === void 0 ? void 0 : currencyList[currencyCode];
    return !!currency;
}
exports.isValidCurrencyCode = isValidCurrencyCode;
function sanitizeCurrencyCode(currencyCode) {
    return isValidCurrencyCode(currencyCode) ? currencyCode : CONST_1["default"].CURRENCY.USD;
}
exports.sanitizeCurrencyCode = sanitizeCurrencyCode;
