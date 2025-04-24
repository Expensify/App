import {addMonths, format, startOfMonth} from 'date-fns';
import CONST from '@src/CONST';

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

export {getNewSubscriptionRenewalDate, formatSubscriptionEndDate};
