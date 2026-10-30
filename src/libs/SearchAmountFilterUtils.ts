// Bare operands store integer hundredths, such as "1250" for 12.50.
// Operands with a comparison currency store decimal major units, such as "12.50 USD".
import CONST from '@src/CONST';

import {convertToBackendAmount, convertToFrontendAmountAsString} from './CurrencyUtils';

type AmountFilterValue = {
    amount: string;
    currency?: string;
};

/** Whether this amount filter supports FX comparisons. */
function supportsAmountFilterCurrency(filterKey: string): boolean {
    return filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT || filterKey === CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT;
}

/** Reads "12.50 USD" as amount "12.50" and currency "USD". Bare values such as "1250" keep their stored units. */
function parseAmountFilterValue(value = ''): AmountFilterValue {
    const match = value.match(/^(-?\d+(?:\.\d{1,2})?) ([A-Z]{3})$/);
    return match ? {amount: match.at(1) ?? '', currency: match.at(2)} : {amount: value};
}

/** Editors use major units, so "1250" becomes "12.50" while "12.50 USD" keeps its amount and currency. */
function getAmountFilterInputValue(value?: string): AmountFilterValue {
    const parsed = parseAmountFilterValue(value);
    return parsed.currency ? parsed : {amount: parsed.amount ? convertToFrontendAmountAsString(Number(parsed.amount), CONST.DEFAULT_CURRENCY_DECIMALS) : ''};
}

/** Saves editor amount "12.50" as "1250" without a currency, or "12.50 USD" with USD selected. */
function formatAmountFilterValue(amount: string, currency?: string): string {
    if (!amount.trim() || !Number.isFinite(Number(amount))) {
        return '';
    }

    const backendAmount = convertToBackendAmount(Number(amount));
    return currency ? `${convertToFrontendAmountAsString(backendAmount, CONST.DEFAULT_CURRENCY_DECIMALS)} ${currency}` : backendAmount.toString();
}

/** The localized formatter expects hundredths, so both "1250" and "12.50 USD" pass 1250 before adding any currency suffix. */
function getAmountFilterDisplayValue(value: string | undefined, formatAmount: (amount: number) => string): string {
    if (!value) {
        return '';
    }

    const parsed = parseAmountFilterValue(value);
    const formattedAmount = formatAmount(parsed.currency ? convertToBackendAmount(Number(parsed.amount)) : Number(parsed.amount));
    return parsed.currency ? `${formattedAmount} ${parsed.currency}` : formattedAmount;
}

export {supportsAmountFilterCurrency, parseAmountFilterValue, getAmountFilterInputValue, formatAmountFilterValue, getAmountFilterDisplayValue};
