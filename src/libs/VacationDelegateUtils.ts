import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import type {Locale as DateFnsLocale} from 'date-fns';

import {addMinutes, format, isValid, parse} from 'date-fns';
import {fromZonedTime} from 'date-fns-tz';

import DateUtils from './DateUtils';

/** Format of the local clear date and time the user picks, e.g. 2026-10-01 17:00:00 */
const LOCAL_DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

/** Time a clear date ends at when no time is picked, so the delegate stays active for the whole day */
const END_OF_DAY_TIME = '23:59:59';

/**
 * Combines the picked clear date (yyyy-MM-dd) and time into the local datetime (yyyy-MM-dd HH:mm:ss) the delegate clears at.
 * The time can be a full datetime, as the time picker stores it; only its time part is used. Without a time, the delegate clears
 * at the end of the picked day.
 */
function getVacationDelegateLocalClearDateTime(clearDate: string | undefined, clearTime: string | undefined): string {
    if (!clearDate) {
        return '';
    }

    return (clearTime ? DateUtils.combineDateAndTime(clearTime, clearDate) : '') || `${clearDate} ${END_OF_DAY_TIME}`;
}

/**
 * Converts the clear date (yyyy-MM-dd) and time picked for the vacation delegate into the UTC datetime the backend expects,
 * reading them in the given timezone.
 */
function getVacationDelegateClearAfter(clearDate: string | undefined, clearTime: string | undefined, timezone: SelectedTimezone | undefined): string | undefined {
    const localClearDateTime = getVacationDelegateLocalClearDateTime(clearDate, clearTime);
    if (!localClearDateTime) {
        return undefined;
    }

    return DateUtils.formatDBTimeWithoutMilliseconds(fromZonedTime(localClearDateTime, timezone ?? CONST.DEFAULT_TIME_ZONE.selected).valueOf());
}

/**
 * Converts the UTC datetime the vacation delegate clears after back into the local datetime (yyyy-MM-dd HH:mm:ss) it clears at in the given timezone.
 */
function getVacationDelegateClearDateTime(clearAfter: string | undefined, timezone: SelectedTimezone | undefined): string {
    if (!clearAfter) {
        return '';
    }

    return DateUtils.formatUTCDateTimeToDateInTimezone(clearAfter, timezone ?? CONST.DEFAULT_TIME_ZONE.selected, LOCAL_DATE_TIME_FORMAT);
}

/**
 * Converts the UTC datetime the vacation delegate clears after back into the day (yyyy-MM-dd) it clears on in the given timezone.
 */
function getVacationDelegateClearDate(clearAfter: string | undefined, timezone: SelectedTimezone | undefined): string {
    return getVacationDelegateClearDateTime(clearAfter, timezone).slice(0, CONST.DATE.FNS_FORMAT_STRING.length);
}

/**
 * Formats a local clear datetime (yyyy-MM-dd HH:mm:ss) for display, e.g. "Oct 1, 2026 5:00 PM".
 */
function formatVacationDelegateClearDateTime(clearDateTime: string, dateFnsLocale: DateFnsLocale | undefined): string {
    const date = parse(clearDateTime, LOCAL_DATE_TIME_FORMAT, new Date());
    if (!isValid(date)) {
        return '';
    }

    return format(date, `${CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT} ${CONST.DATE.LOCAL_TIME_FORMAT}`, {locale: dateFnsLocale});
}

/**
 * Whether the vacation delegate's clearAfter datetime has passed. The backend clears the delegate at that time, so this only covers
 * the gap before its update reaches the client.
 */
function isVacationDelegateExpired(clearAfter: string | undefined): boolean {
    // Both values are UTC in the database format, so they compare as strings.
    return !!clearAfter && clearAfter <= DateUtils.getDBTime();
}

/**
 * Whether the picked clearAfter datetime is less than one minute from now. Such a delegate could clear while the request is still in
 * flight, so the form asks for a time at least one minute ahead.
 */
function isVacationDelegateClearAfterTooSoon(clearAfter: string | undefined): boolean {
    // Both values are UTC in the database format, so they compare as strings.
    return !!clearAfter && clearAfter < DateUtils.formatDBTimeWithoutMilliseconds(addMinutes(new Date(), 1).valueOf());
}

export {
    getVacationDelegateClearAfter,
    getVacationDelegateClearDate,
    getVacationDelegateClearDateTime,
    getVacationDelegateLocalClearDateTime,
    formatVacationDelegateClearDateTime,
    isVacationDelegateExpired,
    isVacationDelegateClearAfterTooSoon,
};
