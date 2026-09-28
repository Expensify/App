import CONST from '@src/CONST';
import type {SelectedTimezone} from '@src/types/onyx/PersonalDetails';

import type {Locale as DateFnsLocale} from 'date-fns';

import {format, isValid, parse} from 'date-fns';

import DateUtils from './DateUtils';

/**
 * Converts the date picked for the vacation delegate to clear on (yyyy-MM-dd) into the UTC datetime the backend expects.
 * The delegate stays active for the whole picked day, so this is the end of that day in the given timezone.
 */
function getVacationDelegateClearAfter(clearDate: string | undefined, timezone: SelectedTimezone | undefined): string | undefined {
    if (!clearDate) {
        return undefined;
    }

    return DateUtils.normalizeDateToEndOfDay(clearDate, timezone ?? CONST.DEFAULT_TIME_ZONE.selected);
}

/**
 * Converts the UTC datetime the vacation delegate clears after back into the day (yyyy-MM-dd) it clears on in the given timezone.
 */
function getVacationDelegateClearDate(clearAfter: string | undefined, timezone: SelectedTimezone | undefined): string {
    if (!clearAfter) {
        return '';
    }

    return DateUtils.formatUTCDateTimeToDateInTimezone(clearAfter, timezone ?? CONST.DEFAULT_TIME_ZONE.selected);
}

/**
 * Formats a clear date (yyyy-MM-dd) for display, e.g. "Oct 1, 2026".
 */
function formatVacationDelegateClearDate(clearDate: string, dateFnsLocale: DateFnsLocale | undefined): string {
    const date = parse(clearDate, CONST.DATE.FNS_FORMAT_STRING, new Date());
    if (!isValid(date)) {
        return '';
    }

    return format(date, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, {locale: dateFnsLocale});
}

/**
 * Whether the vacation delegate's clearAfter datetime has passed. The backend clears the delegate at that time, so this only covers
 * the gap before its update reaches the client.
 */
function isVacationDelegateExpired(clearAfter: string | undefined): boolean {
    // Both values are UTC in the database format, so they compare as strings.
    return !!clearAfter && clearAfter <= DateUtils.getDBTime();
}

export {getVacationDelegateClearAfter, getVacationDelegateClearDate, formatVacationDelegateClearDate, isVacationDelegateExpired};
