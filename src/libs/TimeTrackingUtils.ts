import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {convertToDisplayString} from './CurrencyUtils';

function computeTimeAmount(rateInCents: number, count: number): number {
    return Math.round(rateInCents * count);
}

function formatTimeMerchant(hours: number, rate: number, currency: string, translate: LocalizedTranslate): string {
    return translate('iou.timeTracking.hoursAt', hours, convertToDisplayString(rate, currency));
}

export {computeTimeAmount, formatTimeMerchant};
