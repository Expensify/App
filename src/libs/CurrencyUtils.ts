import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Locale} from '@src/types/onyx';
import Log from './Log';
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
 * Returns true when the provided value is a syntactically valid ISO 4217 currency code
 * (exactly 3 uppercase ASCII letters).
 */
function isValidCurrencyCode(currencyCode: unknown): currencyCode is string {
    return typeof currencyCode === 'string' && /^[A-Z]{3}$/.test(currencyCode);
}

// Tracks invalid currency codes already warned about so the same bad value doesn't spam the log on every render.
const warnedInvalidCurrencyCodes = new Set<string>();

/**
 * Test-only: clears the in-memory de-dup of malformed currency codes so tests asserting on `Log.warn`
 * are not affected by warnings emitted by earlier tests. Production code should not call this.
 */
function resetInvalidCurrencyWarningsForTesting() {
    warnedInvalidCurrencyCodes.clear();
}

/**
 * Validates a currency code and returns it unchanged if it is a valid ISO 4217 code.
 * Whitespace and case-only variations (e.g. " usd ") are normalized rather than discarded.
 * Returns CONST.CURRENCY.USD and logs a warning at most once per unique malformed value, to prevent Intl.NumberFormat
 * from throwing a RangeError. See https://github.com/Expensify/App/issues/91113
 */
function sanitizeCurrencyCode(currencyCode: unknown): string {
    if (isValidCurrencyCode(currencyCode)) {
        return currencyCode;
    }
    const normalized = typeof currencyCode === 'string' ? currencyCode.trim().toUpperCase() : '';
    if (isValidCurrencyCode(normalized)) {
        return normalized;
    }
    if (!warnedInvalidCurrencyCodes.has(normalized)) {
        warnedInvalidCurrencyCodes.add(normalized);
        Log.warn('CurrencyUtils: invalid currency code, defaulting to USD', {currencyCode});
    }
    return CONST.CURRENCY.USD;
}

/**
 * Returns the number of digits after the decimal separator for a specific currency.
 * For currencies that have decimal places > 2, floor to 2 instead:
 * https://github.com/Expensify/App/issues/15878#issuecomment-1496291464
 *
 * @param currency - IOU currency
 */
function getCurrencyDecimals(currency: string = CONST.CURRENCY.USD): number {
    const decimals = currencyList?.[currency]?.decimals;
    return decimals ?? CONST.DEFAULT_CURRENCY_DECIMALS;
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
        currency: sanitizeCurrencyCode(currencyCode),
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
 */
function convertToFrontendAmountAsInteger(amountAsInt: number, decimals: number): number {
    return Number((Math.trunc(amountAsInt) / 100.0).toFixed(decimals));
}

/**
 * Takes an amount in "cents" as an integer and converts it to a string amount used in the frontend.
 *
 * @note we do not support any currencies with more than two decimal places.
 */
function convertToFrontendAmountAsString(amountAsInt: number | null | undefined, decimals: number): string {
    if (amountAsInt === null || amountAsInt === undefined) {
        return '';
    }
    return (Math.trunc(amountAsInt) / 100.0).toFixed(decimals);
}

/**
 * Given an amount in the "cents", convert it to a string for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToDisplayString(amountInCents = 0, currency: string = CONST.CURRENCY.USD, shouldUseLocalCurrencySymbol = false): string {
    const currencyWithFallback = sanitizeCurrencyCode(currency);
    const decimals = getCurrencyDecimals(currencyWithFallback);
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents, decimals);

    if (shouldUseLocalCurrencySymbol) {
        const currencySymbol = getCurrencySymbol(currencyWithFallback);

        if (currencySymbol) {
            const formattedNumber = format(IntlStore.getCurrentLocale(), convertedAmount, {
                style: 'decimal',
                minimumFractionDigits: decimals,
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
        minimumFractionDigits: decimals,
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2,
    });
}

/** Same intended use as convertToDisplayString, but purposely omit currency symbol if not provided */
function convertToDisplayStringWithExplicitCurrency(amountInCents: number, currency: string | undefined): string {
    if (!currency) {
        return convertToDisplayStringWithoutCurrency(amountInCents);
    }
    return convertToDisplayString(amountInCents, currency);
}

/**
 * Given the amount in the "cents", convert it to a short string (no decimals) for display in the UI.
 * The backend always handle things in "cents" (subunit equal to 1/100)
 *
 * @param amountInCents – should be an integer. Anything after a decimal place will be dropped.
 * @param currency - IOU currency
 */
function convertToShortDisplayString(amountInCents = 0, currency: string = CONST.CURRENCY.USD): string {
    // We want to make sure that we are not showing any decimals in the short display string, so we pass 0 as the decimals parameter
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents, 0);

    return format(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency: sanitizeCurrencyCode(currency),

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
        currency: sanitizeCurrencyCode(currency),
        minimumFractionDigits: CONST.MIN_TAX_RATE_DECIMAL_PLACES,
        maximumFractionDigits: CONST.MAX_TAX_RATE_DECIMAL_PLACES,
    });
}

function getAmountWithoutCurrencyIdentifier(value: string, currencyIdentifier: string): string | undefined {
    const trimmedValue = value.trim();
    if (!currencyIdentifier) {
        return undefined;
    }

    if (trimmedValue.startsWith(currencyIdentifier)) {
        return trimmedValue.slice(currencyIdentifier.length).trim();
    }

    if (trimmedValue.endsWith(currencyIdentifier)) {
        return trimmedValue.slice(0, -currencyIdentifier.length).trim();
    }

    return undefined;
}

function getCurrencyCodeFromAmountString(value: string): {currency: string; amount: string} | undefined {
    const trimmedValue = value.trim();
    const possibleCurrencyCode = trimmedValue.slice(0, 3).toUpperCase();
    if (isValidCurrencyCode(possibleCurrencyCode)) {
        const amount = getAmountWithoutCurrencyIdentifier(trimmedValue, possibleCurrencyCode);
        if (amount) {
            return {currency: possibleCurrencyCode, amount};
        }
    }

    const matchingCurrencySymbols = Object.entries(currencyList ?? {})
        .filter(([, currency]) => !!currency?.symbol)
        .sort(([, firstCurrency], [, secondCurrency]) => (secondCurrency?.symbol?.length ?? 0) - (firstCurrency?.symbol?.length ?? 0));

    for (const [currencyCode, currency] of matchingCurrencySymbols) {
        const symbol = currency?.symbol;
        if (!symbol || matchingCurrencySymbols.filter(([, otherCurrency]) => otherCurrency?.symbol === symbol).length > 1) {
            continue;
        }
        const amount = getAmountWithoutCurrencyIdentifier(trimmedValue, symbol);
        if (amount) {
            return {currency: currencyCode, amount};
        }
    }

    return undefined;
}

function getNormalizedAmountString(amount: string): string | undefined {
    const numericAmount = amount.replaceAll(/[^\d.,+-]/g, '');
    if (!/\d/.test(numericAmount)) {
        return undefined;
    }

    const isNegative = numericAmount.startsWith('-');
    const unsignedAmount = numericAmount.replaceAll(/[+-]/g, '');
    const lastCommaIndex = unsignedAmount.lastIndexOf(',');
    const lastPeriodIndex = unsignedAmount.lastIndexOf('.');
    let normalizedAmount = unsignedAmount;

    if (lastCommaIndex !== -1 && lastPeriodIndex !== -1) {
        const decimalSeparator = lastCommaIndex > lastPeriodIndex ? ',' : '.';
        const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
        normalizedAmount = unsignedAmount.replaceAll(thousandsSeparator, '').replace(decimalSeparator, '.');
    } else if (lastCommaIndex !== -1) {
        normalizedAmount = unsignedAmount.replaceAll('.', '').replace(',', '.');
    } else if (lastPeriodIndex !== -1) {
        normalizedAmount = unsignedAmount.replaceAll(',', '');
    }

    return `${isNegative ? '-' : ''}${normalizedAmount}`;
}

/**
 * Backend-generated policy change-log amount strings can contain the currency-list symbol (e.g. "AR$1,40").
 * Convert those strings back through the App currency formatter so rate changes match rate creation logs.
 */
function convertPolicyChangelogAmountToDisplayString(value: string, currency?: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return value;
    }

    const sanitizedCurrency = currency ? sanitizeCurrencyCode(currency) : undefined;
    const currencySymbol = sanitizedCurrency ? getCurrencySymbol(sanitizedCurrency) : undefined;
    const amount = sanitizedCurrency
        ? (getAmountWithoutCurrencyIdentifier(trimmedValue, sanitizedCurrency) ??
          (currencySymbol ? getAmountWithoutCurrencyIdentifier(trimmedValue, currencySymbol) : undefined) ??
          trimmedValue)
        : undefined;
    const parsedCurrencyAmount = amount ? {currency: sanitizedCurrency, amount} : getCurrencyCodeFromAmountString(trimmedValue);
    if (!parsedCurrencyAmount) {
        return value;
    }

    const normalizedAmount = getNormalizedAmountString(parsedCurrencyAmount.amount);
    if (!normalizedAmount) {
        return value;
    }

    const amountAsFloat = Number(normalizedAmount);
    if (!Number.isFinite(amountAsFloat)) {
        return value;
    }

    return convertAmountToDisplayString(convertToBackendAmount(amountAsFloat), parsedCurrencyAmount.currency);
}

/**
 * Acts the same as `convertAmountToDisplayString` but the result string does not contain currency
 */
function convertToDisplayStringWithoutCurrency(amountInCents: number, currency: string = CONST.CURRENCY.USD) {
    const sanitizedCurrency = sanitizeCurrencyCode(currency);
    const decimals = getCurrencyDecimals(sanitizedCurrency);
    const convertedAmount = convertToFrontendAmountAsInteger(amountInCents, decimals);
    return formatToParts(IntlStore.getCurrentLocale(), convertedAmount, {
        style: 'currency',
        currency: sanitizedCurrency,

        // We are forcing the number of decimals because we override the default number of decimals in the backend for some currencies
        // See: https://github.com/Expensify/PHP-Libs/pull/834
        minimumFractionDigits: decimals,
        // For currencies that have decimal places > 2, floor to 2 instead as we don't support more than 2 decimal places.
        maximumFractionDigits: 2,
    })
        .filter((x) => x.type !== 'currency')
        .filter((x) => x.type !== 'literal' || x.value.trim().length !== 0)
        .map((x) => x.value)
        .join('');
}

export {
    isValidCurrencyCode,
    sanitizeCurrencyCode,
    resetInvalidCurrencyWarningsForTesting,
    getCurrencyDecimals,
    getCurrencyUnit,
    getLocalizedCurrencySymbol,
    getCurrencySymbol,
    convertToBackendAmount,
    convertToFrontendAmountAsInteger,
    convertToFrontendAmountAsString,
    convertToDisplayString,
    convertAmountToDisplayString,
    convertPolicyChangelogAmountToDisplayString,
    convertToDisplayStringWithoutCurrency,
    convertToDisplayStringWithExplicitCurrency,
    convertToShortDisplayString,
};
