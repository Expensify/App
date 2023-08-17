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
    return _.isUndefined(decimals) ? 2 : decimals;
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
 * Takes an amount as a floating point number and converts it to an integer equivalent to the amount in "cents".
 * This is because the backend always stores amounts in "cents". The backend works in integer cents to avoid precision errors
 * when doing math operations.
 *
 * @note we do not currently support any currencies with more than two decimal places. Decimal past the second place will be rounded. Sorry Tunisia :(
 *
 * @param {Number} amountAsFloat
 * @returns {Number}
 */
function convertToBackendAmount(amountAsFloat) {
    return Math.round(amountAsFloat * 100);
}

/**
 * Takes an amount in "cents" as an integer and converts it to a floating point amount used in the frontend.
 *
 * @note we do not support any currencies with more than two decimal places.
 *
 * @param {Number} amountAsInt
 * @returns {Number}
 */
function convertToFrontendAmount(amountAsInt) {
    return Math.trunc(amountAsInt) / 100.0;
}

/**
 * Given an amount in the "cents", convert it to a string for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param {Number} amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param {String} currency
 * @returns {String}
 */
function convertToDisplayString(amountInCents, currency = CONST.CURRENCY.USD) {
    const convertedAmount = convertToFrontendAmount(amountInCents);
    return NumberFormatUtils.format(BaseLocaleListener.getPreferredLocale(), convertedAmount, {
        style: 'currency',
        currency,

        // We are forcing the number of decimals because we override the default number of decimals in the backend for RSD
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: currency === 'RSD' ? getCurrencyDecimals(currency) : undefined,
    });
}

export {getCurrencyDecimals, getCurrencyUnit, getLocalizedCurrencySymbol, isCurrencySymbolLTR, convertToBackendAmount, convertToFrontendAmount, convertToDisplayString};
