import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CurrencyList, Locale} from '@src/types/onyx';
import {format, formatToParts} from './NumberFormatUtils';

let currencyList: OnyxValues[typeof ONYXKEYS.CURRENCY_LIST] = {};

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
function getLocalizedCurrencySymbol(locale: Locale | undefined, currencyCode: string): string | undefined {
    const parts = formatToParts(locale, 0, {
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
 * Given an amount in the "cents", convert it to a string for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToDisplayString(amountInCents = 0, currency: string = CONST.CURRENCY.USD, shouldUseLocalCurrencySymbol = false): string {
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents, currency);
    /**
     * Fallback currency to USD if it empty string or undefined
     */
    let currencyWithFallback = currency;
    if (!currency) {
        currencyWithFallback = CONST.CURRENCY.USD;
    }

    if (shouldUseLocalCurrencySymbol) {
        const currencySymbol = getCurrencySymbol(currencyWithFallback);

        if (currencySymbol) {
            const formattedNumber = format(IntlStore.getCurrentLocale(), convertedAmount, {
                style: 'decimal',
                minimumFractionDigits: getCurrencyDecimals(currency),
                maximumFractionDigits: 2,
            });
            return `${currencySymbol}${formattedNumber}`;
        }
    }

    return format(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency: currencyWithFallback,

        // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: getCurrencyDecimals(currency),
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2,
    });
}

/**
 * Given the amount in the "cents", convert it to a short string (no decimals) for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToShortDisplayString(amountInCents = 0, currency: string = CONST.CURRENCY.USD): string {
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents, currency);

    return format(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency,

        // There will be no decimals displayed (e.g. $9)
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
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
 * Acts the same as `convertAmountToDisplayString` but the result string does not contain currency
 */
function convertToDisplayStringWithoutCurrency(amountInCents: number, currency: string = CONST.CURRENCY.USD) {
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents, currency);
    return formatToParts(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency,

        // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: getCurrencyDecimals(currency),
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2,
    })
        .filter((x) => x.type !== 'currency')
        .filter((x) => x.type !== 'literal' || x.value.trim().length !== 0)
        .map((x) => x.value)
        .join('');
}

/**
 * Checks if passed currency code is a valid currency based on currency list
 */
function isValidCurrencyCode(currencyCode: string): boolean {
    const currency = currencyList?.[currencyCode];
    return !!currency;
}

function getCurrencyKeyByCountryCode(currencies?: CurrencyList, countryCode?: string): string {
    if (!currencies || !countryCode) {
        return CONST.CURRENCY.USD;
    }
    for (const [key, value] of Object.entries(currencies)) {
        if (value?.countries?.includes(countryCode)) {
            return key;
        }
    }
    return CONST.CURRENCY.USD;
}

/**
 * Get currency display information for chart labels and tooltips.
 *
 * Uses Intl.NumberFormat to determine the appropriate currency symbol and its position
 * relative to the value based on the user's locale. For example:
 * - USD in en-US: symbol "$", position "left" → "$100"
 * - PLN in pl-PL: symbol "zł", position "right" → "100 zł"
 * - EUR in de-DE: symbol "€", position "right" → "100 €"
 *
 * The function formats a zero value and extracts the currency part from the formatted parts.
 * Position is determined by comparing the index of the currency part to the integer part.
 *
 * @param currencyCode - ISO 4217 currency code (e.g., "USD", "PLN", "EUR")
 * @returns Object with symbol (e.g., "$", "zł", "PLN") and position ("left" or "right")
 */
function getCurrencyDisplayInfoForCharts(currencyCode: string): {symbol: string; position: 'left' | 'right'} {
    const locale = IntlStore.getCurrentLocale();
    const parts = formatToParts(locale, 0, {style: 'currency', currency: currencyCode});

    const currencyIndex = parts.findIndex((p) => p.type === 'currency');
    const integerIndex = parts.findIndex((p) => p.type === 'integer');

    return {
        symbol: parts.find((p) => p.type === 'currency')?.value ?? currencyCode,
        position: currencyIndex < integerIndex ? 'left' : 'right',
    };
}

export {
    getCurrencyDecimals,
    getCurrencyUnit,
    getLocalizedCurrencySymbol,
    getCurrencySymbol,
    getCurrencyKeyByCountryCode,
    getCurrencyDisplayInfoForCharts,
    convertToBackendAmount,
    convertToFrontendAmountAsInteger,
    convertToFrontendAmountAsString,
    convertToDisplayString,
    convertAmountToDisplayString,
    convertToDisplayStringWithoutCurrency,
    isValidCurrencyCode,
    convertToShortDisplayString,
};
