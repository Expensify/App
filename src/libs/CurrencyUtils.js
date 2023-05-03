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
    return _.find(parts, part => part.type === 'currency').value;
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
 * For example, given [25, USD], will return 2500.
 * Given [25.50, USD] will return 2550.
 * Given [2500, JPY], will return 2500.
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

export {
    getCurrencyDecimals,
    getCurrencyUnit,
    getLocalizedCurrencySymbol,
    isCurrencySymbolLTR,
    convertToSmallestUnit,
};
