import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import BaseLocaleListener from './Localize/LocaleListener/BaseLocaleListener';
import * as NumberFormatUtils from './NumberFormatUtils';

let currencyList = {};
Onyx.connect({
    key: ONYXKEYS.CURRENCY_LIST,
    callback: (val) => {
        if (_.isEmpty(val)) {
            return;
        }

        currencyList = val;
    },
});

/**
 * Returns the number of digits after the decimal separator for a specific currency.
 * For currencies that have decimal places > 2, floor to 2 instead:
 * https://github.com/Expensify/App/issues/15878#issuecomment-1496291464
 *
 * @param {String} currency - IOU currency
 * @returns {Number}
 */
function getCurrencyDecimals(currency = CONST.CURRENCY.USD) {
    const decimals = lodashGet(currencyList, [currency, 'decimals']);
    return _.isUndefined(decimals) ? 2 : Math.min(decimals, 2);
}

/**
 * Returns the currency's minor unit quantity
 * e.g. Cent in USD
 *
 * @param {String} currency - IOU currency
 * @returns {Number}
 */
function getCurrencyUnit(currency = CONST.CURRENCY.USD) {
    return 10 ** getCurrencyDecimals(currency);
}

/**
 * Get localized currency symbol for currency(ISO 4217) Code
 *
 * @param {String} currencyCode
 * @returns {String}
 */
function getLocalizedCurrencySymbol(currencyCode) {
    const parts = NumberFormatUtils.formatToParts(BaseLocaleListener.getPreferredLocale(), 0, {
        style: 'currency',
        currency: currencyCode,
    });
    return _.find(parts, (part) => part.type === 'currency').value;
}

/**
 * Whether the currency symbol is left-to-right.
 *
 * @param {String} currencyCode
 * @returns {Boolean}
 */
function isCurrencySymbolLTR(currencyCode) {
    const parts = NumberFormatUtils.formatToParts(BaseLocaleListener.getPreferredLocale(), 0, {
        style: 'currency',
        currency: currencyCode,
    });

    // Currency is LTR when the first part is of currency type.
    return parts[0].type === 'currency';
}

/**
 * Takes an amount as a floating point number and converts it to an integer amount.
 * For example, given [25, USD], return 2500.
 * Given [25.50, USD] return 2550.
 * Given [2500, JPY], return 2500.
 *
 * @note we do not currently support any currencies with more than two decimal places. Sorry Tunisia :(
 *
 * @param {String} currency
 * @param {Number} amountAsFloat
 * @returns {Number}
 */
function convertToSmallestUnit(currency, amountAsFloat) {
    const currencyUnit = getCurrencyUnit(currency);
    return Math.trunc(amountAsFloat * currencyUnit);
}

/**
 * Takes an amount as an integer and converts it to a floating point amount.
 * For example, give [25, USD], return 0.25
 * Given [2550, USD], return 25.50
 * Given [2500, JPY], return 2500
 *
 * @note we do not support any currencies with more than two decimal places.
 *
 * @param {String} currency
 * @param {Number} amountAsInt
 * @returns {Number}
 */
function convertToWholeUnit(currency, amountAsInt) {
    const currencyUnit = getCurrencyUnit(currency);
    return Math.trunc(amountAsInt) / currencyUnit;
}

/**
 * Given an amount in the smallest units of a currency, convert it to a string for display in the UI.
 *
 * @param {Number} amountInSmallestUnit – should be an integer. Anything after a decimal place will be dropped.
 * @param {String} currency
 * @returns {String}
 */
function convertToDisplayString(amountInSmallestUnit, currency = CONST.CURRENCY.USD) {
    const currencyUnit = getCurrencyUnit(currency);
    const convertedAmount = Math.trunc(amountInSmallestUnit) / currencyUnit;
    return NumberFormatUtils.format(BaseLocaleListener.getPreferredLocale(), convertedAmount, {
        style: 'currency',
        currency,
    });
}

export {getCurrencyDecimals, getCurrencyUnit, getLocalizedCurrencySymbol, isCurrencySymbolLTR, convertToSmallestUnit, convertToWholeUnit, convertToDisplayString};
