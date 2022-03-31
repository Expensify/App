import _ from 'underscore';
import * as NumberFormatUtils from './NumberFormatUtils';

/**
 * Get localized currency symbol for SO4217 Code
 * @param {String} preferredLocale
 * @param {String} currencyCode
 * @return {String}
 */
function getLocalizedCurrencySymbol(preferredLocale, currencyCode) {
    const parts = NumberFormatUtils.formatToParts(preferredLocale, 0, {
        style: 'currency',
        currency: currencyCode,
    });
    const currencySymbol = _.find(parts, part => part.type === 'currency').value;
    return currencySymbol;
}

/**
 * Is currency symbol to left
 * @param {String} preferredLocale
 * @param {String} currencyCode
 * @return {Boolean}
 */
function isCurrencySymbolLTR(preferredLocale, currencyCode) {
    const parts = NumberFormatUtils.formatToParts(preferredLocale, 0, {
        style: 'currency',
        currency: currencyCode,
    });

    // The first element of parts will be type: currency for all currency
    // Where it starts with symbol and the other will have it at last
    // If it is not the first, it must be at last
    const isLeft = parts[0].type === 'currency';
    return isLeft;
}

export {
    getLocalizedCurrencySymbol,
    isCurrencySymbolLTR,
};
