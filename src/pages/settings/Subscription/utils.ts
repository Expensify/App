import DateUtils from '@libs/DateUtils';

import type Locale from '@src/types/onyx/Locale';
import type PrivatePromoDiscount from '@src/types/onyx/PrivatePromoDiscount';

import {addMonths, startOfMonth} from 'date-fns';

type PrivatePromoDiscountInfo = {
    isSecretPromoCode: boolean;
    promoDiscountValue: number | undefined;
};

function getPrivatePromoDiscountInfo(privatePromoDiscount: PrivatePromoDiscount | null | undefined, isAnnual: boolean): PrivatePromoDiscountInfo {
    if (typeof privatePromoDiscount === 'number') {
        return {
            isSecretPromoCode: false,
            promoDiscountValue: privatePromoDiscount,
        };
    }

    if (!privatePromoDiscount) {
        return {
            isSecretPromoCode: false,
            promoDiscountValue: undefined,
        };
    }

    const promoDiscountValue = isAnnual ? privatePromoDiscount.yearlySubscriptionDiscount : privatePromoDiscount.monthlySubscriptionDiscount;

    return {
        isSecretPromoCode: !!privatePromoDiscount.isSecretPromoCode,
        promoDiscountValue,
    };
}

function appendMidnightTime(date: string): string {
    return `${date}T00:00:00`;
}

function formatSubscriptionEndDate(date: string | undefined, preferredLocale: Locale): string {
    if (!date) {
        return '';
    }

    const dateWithMidnightTime = appendMidnightTime(date);

    return DateUtils.formatToMediumDate(new Date(dateWithMidnightTime), preferredLocale);
}

function getNewSubscriptionRenewalDate(preferredLocale: Locale): string {
    return DateUtils.formatToMediumDate(startOfMonth(addMonths(new Date(), 12)), preferredLocale);
}

export {getNewSubscriptionRenewalDate, formatSubscriptionEndDate, getPrivatePromoDiscountInfo};
