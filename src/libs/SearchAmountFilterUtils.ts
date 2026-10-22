// Amount filters store bare hundredths or decimal major units followed by a comparison currency.
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

/** Separates a qualified decimal operand without changing legacy hundredths. */
function parseAmountFilterValue(value = ''): AmountFilterValue {
    const match = value.match(/^(-?\d+(?:\.\d{1,2})?) ([A-Z]{3})$/);
    return match ? {amount: match.at(1) ?? '', currency: match.at(2)} : {amount: value};
}

/** Returns the major-unit amount and optional currency used by the editor. */
function getAmountFilterInputValue(value?: string): AmountFilterValue {
    const parsed = parseAmountFilterValue(value);
    return parsed.currency ? parsed : {amount: parsed.amount ? convertToFrontendAmountAsString(Number(parsed.amount), CONST.DEFAULT_CURRENCY_DECIMALS) : ''};
}

/** Serializes editor values in the units expected by currency-qualified and legacy operands. */
function formatAmountFilterValue(amount: string, currency?: string): string {
    if (!amount.trim() || !Number.isFinite(Number(amount))) {
        return '';
    }

    const backendAmount = convertToBackendAmount(Number(amount));
    return currency ? `${convertToFrontendAmountAsString(backendAmount, CONST.DEFAULT_CURRENCY_DECIMALS)} ${currency}` : backendAmount.toString();
}

/** Formats either operand using the caller's localized hundredths formatter. */
function getAmountFilterDisplayValue(value: string | undefined, formatAmount: (amount: number) => string): string {
    if (!value) {
        return '';
    }

    const parsed = parseAmountFilterValue(value);
    const formattedAmount = formatAmount(parsed.currency ? convertToBackendAmount(Number(parsed.amount)) : Number(parsed.amount));
    return parsed.currency ? `${formattedAmount} ${parsed.currency}` : formattedAmount;
}

export {supportsAmountFilterCurrency, parseAmountFilterValue, getAmountFilterInputValue, formatAmountFilterValue, getAmountFilterDisplayValue};
