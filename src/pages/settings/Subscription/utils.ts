import {openLink} from '@libs/actions/Link';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';
import type PrivatePromoDiscount from '@src/types/onyx/PrivatePromoDiscount';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';

import {addMonths, format, startOfMonth} from 'date-fns';

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

function formatSubscriptionEndDate(date: string | undefined, dateFnsLocale: DateFnsLocale | undefined): string {
    if (!date) {
        return '';
    }

    const dateWithMidnightTime = appendMidnightTime(date);

    return format(new Date(dateWithMidnightTime), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, {locale: dateFnsLocale});
}

function getNewSubscriptionRenewalDate(dateFnsLocale: DateFnsLocale | undefined): string {
    return format(startOfMonth(addMonths(new Date(), 12)), CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, {locale: dateFnsLocale});
}

function getExpensifyCodeDiscountMessage(
    translate: (key: 'subscription.expensifyCode.discountMessage', discount: string, cycles: string) => string,
    promoDiscountValue: number,
    validBillingCycles: number | null | undefined,
): string {
    return translate('subscription.expensifyCode.discountMessage', `${promoDiscountValue}`, `${validBillingCycles ?? ''}`);
}

function openSubscriptionDescriptionLink(href: string, adminsChatReportID: string | undefined, environmentURL: string, session: OnyxEntry<Session>): void {
    if (href.endsWith(CONST.SUBSCRIPTION.ADMINS_ROOM_LINK)) {
        if (adminsChatReportID) {
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(adminsChatReportID));
        }
        return;
    }
    if (href.endsWith(CONST.PRICING)) {
        openLink(CONST.PRICING, environmentURL, false, session);
    }
}

export {getNewSubscriptionRenewalDate, formatSubscriptionEndDate, getPrivatePromoDiscountInfo, getExpensifyCodeDiscountMessage, openSubscriptionDescriptionLink};
