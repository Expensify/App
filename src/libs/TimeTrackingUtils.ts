import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {convertToDisplayString} from './CurrencyUtils';

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

export {computeTimeAmount, formatTimeMerchant};
