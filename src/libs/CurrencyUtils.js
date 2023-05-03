import _ from 'underscore';
import BaseLocaleListener from './Localize/LocaleListener/BaseLocaleListener';
import * as NumberFormatUtils from './NumberFormatUtils';

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

export {
    getLocalizedCurrencySymbol,
    isCurrencySymbolLTR,
};
