import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {convertToDisplayString, convertToFrontendAmountAsString} from './CurrencyUtils';
import {validateAmount} from './MoneyRequestUtils';

/**
 * Computes the transaction amount for given hourly rate (in cents) and hour count.
 */
function computeTimeAmount(rateInCents: number, count: number): number {
    return Math.round(rateInCents * count);
}

/**
 * Creates an automatic merchant value for time requests.
 */
function formatTimeMerchant(hours: number, rate: number, currency: string, translate: LocalizedTranslate): string {
    return translate('iou.timeTracking.hoursAt', hours, convertToDisplayString(rate, currency));
}

/**
 * Checks whether the amount calculated via computeTimeAmount is valid (primarily that it is not too big).
 */
function isValidTimeExpenseAmount(amount: number, currency: string | undefined, decimals: number) {
    return validateAmount(convertToFrontendAmountAsString(amount, currency), decimals);
}

export {computeTimeAmount, formatTimeMerchant, isValidTimeExpenseAmount};
