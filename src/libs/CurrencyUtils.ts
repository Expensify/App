import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import {COMMON_CURRENCIES} from '@src/CONST/LOCALES';
import IntlStore from '@src/languages/IntlStore';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {format, formatToParts} from './NumberFormatUtils';

let currencyList: OnyxValues[typeof ONYXKEYS.CURRENCY_LIST] = {};

const currencyFormatterCache = new Map<string, Intl.NumberFormat>();
const CACHE_SIZE_LIMIT = 100;

Onyx.connect({
    key: ONYXKEYS.CURRENCY_LIST,
    callback: (val) => {
        if (!val || Object.keys(val).length === 0) {
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
 * @param currency - IOU currency
 */
function getCurrencyDecimals(currency: string = CONST.CURRENCY.USD): number {
    const decimals = currencyList?.[currency]?.decimals;
    return decimals ?? 2;
}

/**
 * Returns the currency's minor unit quantity
 * e.g. Cent in USD
 *
 * @param currency - IOU currency
 */
function getCurrencyUnit(currency: string = CONST.CURRENCY.USD): number {
    return 10 ** getCurrencyDecimals(currency);
}

/**
 * Get localized currency symbol for currency(ISO 4217) Code
 */
function getLocalizedCurrencySymbol(currencyCode: string): string | undefined {
    const parts = formatToParts(IntlStore.getCurrentLocale(), 0, {
        style: 'currency',
        currency: currencyCode,
    });
    return parts.find((part) => part.type === 'currency')?.value;
}

/**
 * Get the currency symbol for a currency(ISO 4217) Code
 */
function getCurrencySymbol(currencyCode: string): string | undefined {
    return currencyList?.[currencyCode]?.symbol;
}

/**
 * Takes an amount as a floating point number and converts it to an integer equivalent to the amount in "cents".
 * This is because the backend always stores amounts in "cents". The backend works in integer cents to avoid precision errors
 * when doing math operations.
 *
 * @note we do not currently support any currencies with more than two decimal places. Decimal past the second place will be rounded. Sorry Tunisia :(
 */
function convertToBackendAmount(amountAsFloat: number): number {
    return Math.round(amountAsFloat * 100);
}

/**
 * Takes an amount in "cents" as an integer and converts it to a floating point amount used in the frontend.
 *
 * @note we do not support any currencies with more than two decimal places.
 */
function convertToFrontendAmountAsInteger(amountAsInt: number, currency: string = CONST.CURRENCY.USD): number {
    const decimals = getCurrencyDecimals(currency);
    return Number((Math.trunc(amountAsInt) / 100.0).toFixed(decimals));
}

/**
 * Takes an amount in "cents" as an integer and converts it to a string amount used in the frontend.
 *
 * @note we do not support any currencies with more than two decimal places.
 */
function convertToFrontendAmountAsString(amountAsInt: number | null | undefined, currency: string = CONST.CURRENCY.USD, withDecimals = true): string {
    if (amountAsInt === null || amountAsInt === undefined) {
        return '';
    }
    const decimals = withDecimals ? getCurrencyDecimals(currency) : 0;
    return convertToFrontendAmountAsInteger(amountAsInt, currency).toFixed(decimals);
}

/**
 * Get a cached currency formatter for better performance
 */
function getCachedCurrencyFormatter(locale: string, currency: string, decimals: number): Intl.NumberFormat | undefined {
    const key = `${locale}-${currency}-${decimals}`;

    if (!currencyFormatterCache.has(key)) {
        // Limit cache size to prevent memory issues
        if (currencyFormatterCache.size >= CACHE_SIZE_LIMIT) {
            // Remove oldest entries (first half of the cache)
            const entriesToDelete = Array.from(currencyFormatterCache.keys()).slice(0, CACHE_SIZE_LIMIT / 2);
            entriesToDelete.forEach((k) => currencyFormatterCache.delete(k));
        }

        currencyFormatterCache.set(
            key,
            new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
                minimumFractionDigits: decimals,
                maximumFractionDigits: Math.min(decimals, 2),
            }),
        );
    }

    return currencyFormatterCache.get(key);
}

/**
 * Given an amount in the "cents", convert it to a string for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToDisplayString(amountInCents = 0, currency: string = CONST.CURRENCY.USD): string | undefined {
    const currencyWithFallback = currency || CONST.CURRENCY.USD;
    const amount = convertToFrontendAmountAsInteger(amountInCents, currencyWithFallback);
    const decimals = getCurrencyDecimals(currencyWithFallback);
    const locale = IntlStore.getCurrentLocale() ?? CONST.LOCALES.DEFAULT;

    try {
        // Use cached formatter for better performance while preserving locale
        const formatter = getCachedCurrencyFormatter(locale, currencyWithFallback, decimals);
        return formatter?.format(amount);
    } catch (e) {
        // Fallback to manual formatting if Intl fails
        const symbol = getCurrencySymbol(currencyWithFallback) ?? currencyWithFallback;
        const formatted = Math.abs(amount)
            .toFixed(decimals)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
    }
}

/**
 * Given the amount in the "cents", convert it to a short string (no decimals) for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToShortDisplayString(amountInCents = 0, currency: string = CONST.CURRENCY.USD): string | undefined {
    const currencyWithFallback = currency || CONST.CURRENCY.USD;
    const amount = convertToFrontendAmountAsInteger(amountInCents, currencyWithFallback);
    const locale = IntlStore.getCurrentLocale() ?? CONST.LOCALES.DEFAULT;

    try {
        // Use cached formatter with 0 decimals
        const formatter = getCachedCurrencyFormatter(locale, currencyWithFallback, 0);
        return formatter?.format(amount);
    } catch (e) {
        // Fallback to manual formatting if Intl fails
        const symbol = getCurrencySymbol(currencyWithFallback) ?? currencyWithFallback;
        const formatted = Math.abs(amount)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
    }
}

/**
 * Given an amount, convert it to a string for display in the UI.
 *
 * @param amount – should be a float.
 * @param currency - IOU currency
 */
function convertAmountToDisplayString(amount = 0, currency: string = CONST.CURRENCY.USD): string {
    const convertedAmount = amount / 100.0;
    return format(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency,
        minimumFractionDigits: CONST.MIN_TAX_RATE_DECIMAL_PLACES,
        maximumFractionDigits: CONST.MAX_TAX_RATE_DECIMAL_PLACES,
    });
}

/**
 * Get a cached number formatter (without currency) for better performance
 */
function getCachedNumberFormatter(locale: string, decimals: number): Intl.NumberFormat | undefined {
    const key = `${locale}-decimal-${decimals}`;

    if (!currencyFormatterCache.has(key)) {
        // Limit cache size to prevent memory issues
        if (currencyFormatterCache.size >= CACHE_SIZE_LIMIT) {
            // Remove oldest entries (first half of the cache)
            const entriesToDelete = Array.from(currencyFormatterCache.keys()).slice(0, CACHE_SIZE_LIMIT / 2);
            entriesToDelete.forEach((k) => currencyFormatterCache.delete(k));
        }

        currencyFormatterCache.set(
            key,
            new Intl.NumberFormat(locale, {
                style: 'decimal',
                minimumFractionDigits: decimals,
                maximumFractionDigits: Math.min(decimals, 2),
            }),
        );
    }

    return currencyFormatterCache.get(key);
}

/**
 * Acts the same as `convertAmountToDisplayString` but the result string does not contain currency
 */
function convertToDisplayStringWithoutCurrency(amountInCents: number, currency: string = CONST.CURRENCY.USD) {
    const amount = convertToFrontendAmountAsInteger(amountInCents, currency);
    const decimals = getCurrencyDecimals(currency);
    const locale = IntlStore.getCurrentLocale() ?? CONST.LOCALES.DEFAULT;

    try {
        // Use cached number formatter for locale-aware formatting without currency
        const formatter = getCachedNumberFormatter(locale, decimals);
        return formatter?.format(amount);
    } catch (e) {
        // Fallback to manual formatting if Intl fails
        const formatted = Math.abs(amount)
            .toFixed(decimals)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `${amount < 0 ? '-' : ''}${formatted}`;
    }
}

/**
 * Checks if passed currency code is a valid currency based on currency list
 */
function isValidCurrencyCode(currencyCode: string): boolean {
    const currency = currencyList?.[currencyCode];
    return !!currency;
}

function sanitizeCurrencyCode(currencyCode: string): string {
    return isValidCurrencyCode(currencyCode) ? currencyCode : CONST.CURRENCY.USD;
}

/**
 * Pre-warm the formatter cache with common currency combinations
 * This improves performance for frequently used currencies
 */
function prewarmCurrencyCache() {
    const locale = IntlStore.getCurrentLocale() ?? CONST.LOCALES.DEFAULT;

    COMMON_CURRENCIES.forEach((currency) => {
        const decimals = getCurrencyDecimals(currency);
        // Pre-create formatters for common currencies
        getCachedCurrencyFormatter(locale, currency, decimals);
        getCachedCurrencyFormatter(locale, currency, 0);
    });
}

export {
    getCurrencyDecimals,
    getCurrencyUnit,
    getLocalizedCurrencySymbol,
    getCurrencySymbol,
    convertToBackendAmount,
    convertToFrontendAmountAsInteger,
    convertToFrontendAmountAsString,
    convertToDisplayString,
    convertAmountToDisplayString,
    convertToDisplayStringWithoutCurrency,
    isValidCurrencyCode,
    convertToShortDisplayString,
    sanitizeCurrencyCode,
    prewarmCurrencyCache,
};
