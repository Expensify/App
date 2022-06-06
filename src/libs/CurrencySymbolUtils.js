import _ from 'underscore';
import * as NumberFormatUtils from './NumberFormatUtils';

/**
 * Get localized currency symbol for currency(ISO 4217) Code
 * @param {String} preferredLocale
 * @param {String} currencyCode
 * @returns {String}
 */
function getLocalizedCurrencySymbol(preferredLocale, currencyCode) {
    const parts = NumberFormatUtils.formatToParts(preferredLocale, 0, {
        style: 'currency',
        currency: currencyCode,
    });
    return _.find(parts, part => part.type === 'currency').value;
}

/**
 * Whether the currency symbol is left-to-right.
 * @param {String} preferredLocale
 * @param {String} currencyCode
 * @returns {Boolean}
 */
function isCurrencySymbolLTR(preferredLocale, currencyCode) {
    const parts = NumberFormatUtils.formatToParts(preferredLocale, 0, {
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
