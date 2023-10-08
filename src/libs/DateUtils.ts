import {zonedTimeToUtc, utcToZonedTime, formatInTimeZone} from 'date-fns-tz';
import {es, enGB} from 'date-fns/locale';
import {
    formatDistanceToNow,
    subMinutes,
    addDays,
    subDays,
    isBefore,
    subMilliseconds,
    startOfWeek,
    endOfWeek,
    format,
    setDefaultOptions,
    endOfDay,
    isSameDay,
    isAfter,
    isSameYear,
    eachMonthOfInterval,
    eachDayOfInterval,
} from 'date-fns';

import Onyx from 'react-native-onyx';
import throttle from 'lodash/throttle';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as Localize from './Localize';
import * as CurrentDate from './actions/CurrentDate';
import {Timezone} from '../types/onyx/PersonalDetails';

let currentUserAccountID: number | undefined;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserAccountID = val.accountID;
    },
});

let timezone: Required<Timezone> = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!currentUserAccountID) {
            return;
        }

        const personalDetailsTimezone = value?.[currentUserAccountID]?.timezone;

        timezone = {
            selected: personalDetailsTimezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
            automatic: personalDetailsTimezone?.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
        };
    },
});

/**
 * Gets the locale string and setting default locale for date-fns
 */
function setLocale(localeString: string) {
    switch (localeString) {
        case CONST.LOCALES.EN:
            setDefaultOptions({locale: enGB});
            break;
        case CONST.LOCALES.ES:
            setDefaultOptions({locale: es});
            break;
        default:
            break;
    }
}

/**
 * Gets the user's stored time zone NVP and returns a localized
 * Date object for the given ISO-formatted datetime string
 */
function getLocalDateFromDatetime(locale: string, datetime: string, currentSelectedTimezone = timezone.selected): Date {
    setLocale(locale);
    if (!datetime) {
        return utcToZonedTime(new Date(), currentSelectedTimezone);
    }
    const parsedDatetime = new Date(`${datetime}Z`);
    return utcToZonedTime(parsedDatetime, currentSelectedTimezone);
}

/**
 * Checks if a given date is today in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is today; otherwise, false.
 */
function isToday(date: Date, timeZone: string): boolean {
    const currentDate = new Date();
    const currentDateInTimeZone = utcToZonedTime(currentDate, timeZone);
    return isSameDay(date, currentDateInTimeZone);
}

/**
 * Checks if a given date is tomorrow in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is tomorrow; otherwise, false.
 */
function isTomorrow(date: Date, timeZone: string): boolean {
    const currentDate = new Date();
    const tomorrow = addDays(currentDate, 1); // Get the date for tomorrow in the current time zone
    const tomorrowInTimeZone = utcToZonedTime(tomorrow, timeZone);
    return isSameDay(date, tomorrowInTimeZone);
}

/**
 * Checks if a given date is yesterday in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is yesterday; otherwise, false.
 */
function isYesterday(date: Date, timeZone: string): boolean {
    const currentDate = new Date();
    const yesterday = subDays(currentDate, 1); // Get the date for yesterday in the current time zone
    const yesterdayInTimeZone = utcToZonedTime(yesterday, timeZone);
    return isSameDay(date, yesterdayInTimeZone);
}

/**
 * Formats an ISO-formatted datetime string to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 */
function datetimeToCalendarTime(locale: string, datetime: string, includeTimeZone = false, currentSelectedTimezone = timezone.selected, isLowercase = false): string {
    const date = getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone);
    const tz = includeTimeZone ? ' [UTC]Z' : '';
    let todayAt = Localize.translate(locale, 'common.todayAt');
    let tomorrowAt = Localize.translate(locale, 'common.tomorrowAt');
    let yesterdayAt = Localize.translate(locale, 'common.yesterdayAt');
    const at = Localize.translate(locale, 'common.conjunctionAt');

    const startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn: 1}); // Assuming Monday is the start of the week
    const endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn: 1}); // Assuming Monday is the start of the week

    if (isLowercase) {
        todayAt = todayAt.toLowerCase();
        tomorrowAt = tomorrowAt.toLowerCase();
        yesterdayAt = yesterdayAt.toLowerCase();
    }

    if (isToday(date, currentSelectedTimezone)) {
        return `${todayAt} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
    }
    if (isTomorrow(date, currentSelectedTimezone)) {
        return `${tomorrowAt} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
    }
    if (isYesterday(date, currentSelectedTimezone)) {
        return `${yesterdayAt} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
    }
    if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
        return `${format(date, CONST.DATE.MONTH_DAY_ABBR_FORMAT)} ${at} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
    }
    return `${format(date, CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT)} ${at} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
}

/**
 * Converts an ISO-formatted datetime string into a localized string representation
 * that's relative to current moment in time.
 *
 * e.g.
 *
 * < 1 minute ago       within the past minute
 * 12 minutes ago       within the past hour
 * 1 hour ago           within the past day
 * 3 days ago           within the past month
 * Jan 20               within the past year
 * Jan 20, 2019         anything over 1 year
 */
function datetimeToRelative(locale: string, datetime: string): string {
    const date = getLocalDateFromDatetime(locale, datetime);
    return formatDistanceToNow(date, {addSuffix: true});
}

/**
 * Gets the zone abbreviation from the date
 *
 * e.g.
 *
 * PST
 * EST
 * GMT +07  -  For GMT timezone
 *
 * @param datetime
 * @param selectedTimezone
 * @returns
 */
function getZoneAbbreviation(datetime: string, selectedTimezone: string): string {
    return formatInTimeZone(datetime, selectedTimezone, 'zzz');
}

/**
 * Format date to a long date format with weekday
 *
 * @returns Sunday, July 9, 2023
 */
function formatToLongDateWithWeekday(datetime: string): string {
    return format(new Date(datetime), CONST.DATE.LONG_DATE_FORMAT_WITH_WEEKDAY);
}

/**
 * Format date to a weekday format
 *
 * @returns Sunday
 */
function formatToDayOfWeek(datetime: string): string {
    return format(new Date(datetime), CONST.DATE.WEEKDAY_TIME_FORMAT);
}

/**
 * Format date to a local time
 *
 * @returns 2:30 PM
 */
function formatToLocalTime(datetime: string): string {
    return format(new Date(datetime), CONST.DATE.LOCAL_TIME_FORMAT);
}

const THREE_HOURS = 1000 * 60 * 60 * 3;

/**
 * A throttled version of a function that updates the current date in Onyx store
 */
const updateCurrentDate = throttle(() => {
    const currentDate = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    CurrentDate.setCurrentDate(currentDate);
}, THREE_HOURS);

/**
 * Initialises the event listeners that trigger the current date update
 */
function startCurrentDateUpdater() {
    const trackedEvents = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    trackedEvents.forEach((eventName) => {
        document.addEventListener(eventName, updateCurrentDate);
    });
}

function getCurrentTimezone(): Required<Timezone> {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        return {...timezone, selected: currentTimezone};
    }
    return timezone;
}

/**
 * @returns [January, Fabruary, March, April, May, June, July, August, ...]
 */
function getMonthNames(preferredLocale: string): string[] {
    if (preferredLocale) {
        setLocale(preferredLocale);
    }
    const fullYear = new Date().getFullYear();
    const monthsArray = eachMonthOfInterval({
        start: new Date(fullYear, 0, 1), // January 1st of the current year
        end: new Date(fullYear, 11, 31), // December 31st of the current year
    });

    // eslint-disable-next-line rulesdir/prefer-underscore-method
    return monthsArray.map((monthDate) => format(monthDate, CONST.DATE.MONTH_FORMAT));
}

/**
 * @returns [Monday, Thuesday, Wednesday, ...]
 */
function getDaysOfWeek(preferredLocale: string): string[] {
    if (preferredLocale) {
        setLocale(preferredLocale);
    }
    const startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn: 1}); // Assuming Monday is the start of the week
    const endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn: 1}); // Assuming Monday is the start of the week
    const daysOfWeek = eachDayOfInterval({start: startOfCurrentWeek, end: endOfCurrentWeek});

    // eslint-disable-next-line rulesdir/prefer-underscore-method
    return daysOfWeek.map((date) => format(date, 'eeee'));
}

// Used to throttle updates to the timezone when necessary
let lastUpdatedTimezoneTime = new Date();

function canUpdateTimezone(): boolean {
    const currentTime = new Date();
    const fiveMinutesAgo = subMinutes(currentTime, 5);
    // Compare the last updated time with five minutes ago
    return isBefore(lastUpdatedTimezoneTime, fiveMinutesAgo);
}

function setTimezoneUpdated() {
    lastUpdatedTimezoneTime = new Date();
}

/**
 * Get the UNIX timestamp in microseconds, with millisecond precision.
 */
function getMicroseconds(): number {
    return Date.now() * CONST.MICROSECONDS_PER_MS;
}

/**
 * Returns the current time in milliseconds in the format expected by the database
 */
function getDBTime(timestamp: string | number = ''): string {
    const datetime = timestamp ? new Date(timestamp) : new Date();
    return datetime.toISOString().replace('T', ' ').replace('Z', '');
}

function subtractMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = zonedTimeToUtc(dateTime, 'UTC');
    const newTimestamp = subMilliseconds(date, milliseconds).valueOf();

    return getDBTime(newTimestamp);
}

/**
 * @param isoTimestamp example: 2023-05-16 05:34:14.388
 * @returns example: 2023-05-16
 */
function getDateStringFromISOTimestamp(isoTimestamp: string): string {
    if (!isoTimestamp) {
        return '';
    }

    const [dateString] = isoTimestamp.split(' ');
    return dateString;
}

/**
 * receive date like 2020-05-16 05:34:14 and format it to show in string like "Until 05:34 PM"
 */
function getStatusUntilDate(inputDate: string): string {
    if (!inputDate) {
        return '';
    }
    const {translateLocal} = Localize;

    const input = new Date(inputDate);
    const now = new Date();
    const endOfToday = endOfDay(now);

    // If the date is equal to the end of today
    if (isSameDay(input, endOfToday)) {
        return translateLocal('statusPage.untilTomorrow');
    }

    // If it's a time on the same date
    if (isSameDay(input, now)) {
        return translateLocal('statusPage.untilTime', {time: format(input, CONST.DATE.LOCAL_TIME_FORMAT)});
    }

    // If it's further in the future than tomorrow but within the same year
    if (isAfter(input, now) && isSameYear(input, now)) {
        return translateLocal('statusPage.untilTime', {time: format(input, `${CONST.DATE.SHORT_DATE_FORMAT} ${CONST.DATE.LOCAL_TIME_FORMAT}`)});
    }

    // If it's in another year
    return translateLocal('statusPage.untilTime', {time: format(input, `${CONST.DATE.FNS_FORMAT_STRING} ${CONST.DATE.LOCAL_TIME_FORMAT}`)});
}

const DateUtils = {
    formatToDayOfWeek,
    formatToLongDateWithWeekday,
    formatToLocalTime,
    getZoneAbbreviation,
    datetimeToRelative,
    datetimeToCalendarTime,
    startCurrentDateUpdater,
    getLocalDateFromDatetime,
    getCurrentTimezone,
    canUpdateTimezone,
    setTimezoneUpdated,
    getMicroseconds,
    getDBTime,
    setLocale,
    subtractMillisecondsFromDateTime,
    getDateStringFromISOTimestamp,
    getStatusUntilDate,
    isToday,
    isTomorrow,
    isYesterday,
    getMonthNames,
    getDaysOfWeek,
};

export default DateUtils;
