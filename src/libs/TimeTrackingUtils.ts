import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {convertToDisplayString} from './CurrencyUtils';

/**
 * Computes the transaction amount for given hourly rate (as a formatted number in currency units) and hour count.
 */
function computeTimeAmount(rate: number, count: number): number {
    return Math.round(rate * 100 * count);
}

/**
 * Creates an automatic merchant value for time requests.
 */
function formatTimeMerchant(hours: number, rate: number, currency: string, translate: LocalizedTranslate): string {
    return translate('iou.timeTracking.hoursAt', hours, convertToDisplayString(rate, currency));
}

export {computeTimeAmount, formatTimeMerchant};
