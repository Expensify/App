import {addMonths, format, startOfMonth} from 'date-fns';
import CONST from '@src/CONST';
import type PrivatePromoDiscount from '@src/types/onyx/PrivatePromoDiscount';

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

function formatSubscriptionEndDate(date: string | undefined): string {
    if (!date) {
        return '';
    }

    const dateWithMidnightTime = appendMidnightTime(date);

    return format(new Date(dateWithMidnightTime), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);
}

function getNewSubscriptionRenewalDate(): string {
    return format(startOfMonth(addMonths(new Date(), 12)), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT);
}

export {getNewSubscriptionRenewalDate, formatSubscriptionEndDate, getPrivatePromoDiscountInfo};
