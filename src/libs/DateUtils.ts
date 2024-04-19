import {
    addDays,
    addHours,
    addMilliseconds,
    addMinutes,
    eachDayOfInterval,
    eachMonthOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    formatDistanceToNow,
    getDate,
    getDay,
    isAfter,
    isBefore,
    isSameDay,
    isSameSecond,
    isSameYear,
    isValid,
    parse,
    set,
    setDefaultOptions,
    startOfDay,
    startOfWeek,
    subDays,
    subMilliseconds,
    subMinutes,
} from 'date-fns';
import {formatInTimeZone, format as tzFormat, utcToZonedTime, zonedTimeToUtc} from 'date-fns-tz';
import enGB from 'date-fns/locale/en-GB';
import es from 'date-fns/locale/es';
import throttle from 'lodash/throttle';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {timezoneBackwardMap} from '@src/TIMEZONES';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import * as CurrentDate from './actions/CurrentDate';
import * as Localize from './Localize';
import Log from './Log';

type CustomStatusTypes = (typeof CONST.CUSTOM_STATUS_TYPES)[keyof typeof CONST.CUSTOM_STATUS_TYPES];
type TimePeriod = 'AM' | 'PM';
type Locale = ValueOf<typeof CONST.LOCALES>;
type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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

let networkTimeSkew = 0;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => (networkTimeSkew = value?.timeSkew ?? 0),
});

/**
 * Get the day of the week that the week starts on
 */
function getWeekStartsOn(): WeekDay {
    return CONST.WEEK_STARTS_ON;
}

/**
 * Get the day of the week that the week ends on
 */
function getWeekEndsOn(): WeekDay {
    const weekStartsOn = getWeekStartsOn();

    return weekStartsOn === 0 ? 6 : ((weekStartsOn - 1) as WeekDay);
}

/**
 * Gets the locale string and setting default locale for date-fns
 */
function setLocale(localeString: Locale) {
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
function getLocalDateFromDatetime(locale: Locale, datetime?: string, currentSelectedTimezone: SelectedTimezone = timezone.selected): Date {
    setLocale(locale);
    if (!datetime) {
        const res = utcToZonedTime(new Date(), currentSelectedTimezone);
        if (Number.isNaN(res.getTime())) {
            Log.warn('DateUtils.getLocalDateFromDatetime: utcToZonedTime returned an invalid date. Returning current date.', {
                locale,
                datetime,
                currentSelectedTimezone,
            });
            return new Date();
        }
        return res;
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
function isToday(date: Date, timeZone: SelectedTimezone): boolean {
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
function isTomorrow(date: Date, timeZone: SelectedTimezone): boolean {
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
function isYesterday(date: Date, timeZone: SelectedTimezone): boolean {
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
function datetimeToCalendarTime(locale: Locale, datetime: string, includeTimeZone = false, currentSelectedTimezone: SelectedTimezone = timezone.selected, isLowercase = false): string {
    const date = getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone);
    const tz = includeTimeZone ? ' [UTC]Z' : '';
    let todayAt = Localize.translate(locale, 'common.todayAt');
    let tomorrowAt = Localize.translate(locale, 'common.tomorrowAt');
    let yesterdayAt = Localize.translate(locale, 'common.yesterdayAt');
    const at = Localize.translate(locale, 'common.conjunctionAt');
    const weekStartsOn = getWeekStartsOn();

    const startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn});
    const endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn});

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
function datetimeToRelative(locale: Locale, datetime: string): string {
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
function getZoneAbbreviation(datetime: string | Date, selectedTimezone: SelectedTimezone): string {
    return formatInTimeZone(datetime, selectedTimezone, 'zzz');
}

/**
 * Format date to a long date format with weekday
 *
 * @returns Sunday, July 9, 2023
 */
function formatToLongDateWithWeekday(datetime: string | Date): string {
    return format(new Date(datetime), CONST.DATE.LONG_DATE_FORMAT_WITH_WEEKDAY);
}

/**
 * Format date to a weekday format
 *
 * @returns Sunday
 */
function formatToDayOfWeek(datetime: Date): string {
    return format(datetime, CONST.DATE.WEEKDAY_TIME_FORMAT);
}

/**
 * Format date to a local time
 *
 * @returns 2:30 PM
 */
function formatToLocalTime(datetime: string | Date): string {
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
        return {...timezone, selected: currentTimezone as SelectedTimezone};
    }
    return timezone;
}

/**
 * @returns [January, Fabruary, March, April, May, June, July, August, ...]
 */
function getMonthNames(preferredLocale: Locale): string[] {
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
function getDaysOfWeek(preferredLocale: Locale): string[] {
    if (preferredLocale) {
        setLocale(preferredLocale);
    }
    const weekStartsOn = getWeekStartsOn();
    const startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn});
    const endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn});
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

function getDBTimeFromDate(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Convert the given timestamp to the "yyyy-MM-dd HH:mm:ss" format, as expected by the database
 *
 * @param [timestamp] the given timestamp (if omitted, defaults to the current time)
 */
function getDBTime(timestamp: string | number = ''): string {
    const datetime = timestamp ? new Date(timestamp) : new Date();
    return getDBTimeFromDate(datetime);
}

/**
 * Returns the current time plus skew in milliseconds in the format expected by the database
 */
function getDBTimeWithSkew(): string {
    if (networkTimeSkew > 0) {
        return getDBTime(new Date().valueOf() + networkTimeSkew);
    }
    return getDBTime();
}

function subtractMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = zonedTimeToUtc(dateTime, 'UTC');
    const newTimestamp = subMilliseconds(date, milliseconds).valueOf();

    return getDBTime(newTimestamp);
}

function addMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = zonedTimeToUtc(dateTime, 'UTC');
    const newTimestamp = addMilliseconds(date, milliseconds).valueOf();

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
 * returns {string} example: 2023-05-16 05:34:14
 */
function getThirtyMinutesFromNow(): string {
    const date = addMinutes(new Date(), 30);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneHourFromNow(): string {
    const date = addHours(new Date(), 1);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getEndOfToday(): string {
    const date = endOfDay(new Date());
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneWeekFromNow(): string {
    const date = addDays(new Date(), 7);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16
 */
function extractDate(dateTimeString: string): string {
    if (!dateTimeString) {
        return '';
    }
    if (dateTimeString === 'never') {
        return '';
    }
    const date = new Date(dateTimeString);
    return format(date, 'yyyy-MM-dd');
}

/**
 * param {string} dateTimeString
 * returns {string} example: 11:10 PM
 */
function extractTime12Hour(dateTimeString: string): string {
    if (!dateTimeString || dateTimeString === 'never') {
        return '';
    }
    const date = new Date(dateTimeString);
    return format(date, 'hh:mm a');
}

/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16 11:10 PM
 */
function formatDateTimeTo12Hour(dateTimeString: string): string {
    if (!dateTimeString) {
        return '';
    }
    const date = new Date(dateTimeString);
    return format(date, 'yyyy-MM-dd hh:mm a');
}

/**
 * param {string} type - one of the values from CONST.CUSTOM_STATUS_TYPES
 * returns {string} example: 2023-05-16 11:10:00 or ''
 */
function getDateFromStatusType(type: CustomStatusTypes): string {
    switch (type) {
        case CONST.CUSTOM_STATUS_TYPES.THIRTY_MINUTES:
            return getThirtyMinutesFromNow();
        case CONST.CUSTOM_STATUS_TYPES.ONE_HOUR:
            return getOneHourFromNow();
        case CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY:
            return getEndOfToday();
        case CONST.CUSTOM_STATUS_TYPES.AFTER_WEEK:
            return getOneWeekFromNow();
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
            return CONST.CUSTOM_STATUS_TYPES.NEVER;
        default:
            return '';
    }
}

/**
 * param {string} data - either a value from CONST.CUSTOM_STATUS_TYPES or a dateTime string in the format YYYY-MM-DD HH:mm
 * returns {string} example: 2023-05-16 11:10 PM or 'Today'
 */
function getLocalizedTimePeriodDescription(data: string): string {
    const {translateLocal} = Localize;
    switch (data) {
        case getEndOfToday():
            return translateLocal('statusPage.timePeriods.afterToday');
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return translateLocal('statusPage.timePeriods.never');
        default:
            return formatDateTimeTo12Hour(data);
    }
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

/**
 * Update the time for a given date.
 *
 * param {string} updatedTime - Time in "hh:mm A" or "HH:mm:ss" or "yyyy-MM-dd HH:mm:ss" format.
 * param {string} inputDateTime - Date in "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD" format.
 * returns {string} - Date with updated time in "YYYY-MM-DD HH:mm:ss" format.
 */
const combineDateAndTime = (updatedTime: string, inputDateTime: string): string => {
    if (!updatedTime || !inputDateTime) {
        return '';
    }

    let parsedTime: Date | null = null;
    if (updatedTime.includes('-')) {
        // it's in "yyyy-MM-dd HH:mm:ss" format
        const tempTime = parse(updatedTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValid(tempTime)) {
            parsedTime = tempTime;
        }
    } else if (updatedTime.includes(':')) {
        // it's in "hh:mm a" format
        const tempTime = parse(updatedTime, 'hh:mm a', new Date());
        if (isValid(tempTime)) {
            parsedTime = tempTime;
        }
    }

    if (!parsedTime) {
        return '';
    }

    let parsedDateTime: Date | null = null;
    if (inputDateTime.includes(':')) {
        // Check if it includes time
        const tempDateTime = parse(inputDateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (isValid(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    } else {
        const tempDateTime = parse(inputDateTime, 'yyyy-MM-dd', new Date());
        if (isValid(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    }

    if (!parsedDateTime) {
        return '';
    }

    const updatedDateTime = set(parsedDateTime, {
        hours: parsedTime.getHours(),
        minutes: parsedTime.getMinutes(),
        seconds: parsedTime.getSeconds(),
    });

    return format(updatedDateTime, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * param {String} dateTime in 'HH:mm:ss' format
 * returns {Object}
 * example {hour: '11', minute: '10', period: 'AM'}
 */
function get12HourTimeObjectFromDate(dateTime: string): {hour: string; minute: string; period: string} {
    if (!dateTime) {
        return {
            hour: '12',
            minute: '00',
            period: 'PM',
        };
    }
    const parsedTime = parse(dateTime, 'hh:mm a', new Date());
    return {
        hour: format(parsedTime, 'hh'),
        minute: format(parsedTime, 'mm'),
        period: format(parsedTime, 'a').toUpperCase(),
    };
}

/**
 * param {String} timeString
 * returns {String}
 * example getTimePeriod('11:10 PM') // 'PM'
 */
function getTimePeriod(timeString: string): TimePeriod {
    const parts = timeString.split(' ');
    return parts[1] as TimePeriod;
}

/**
 * param {String} dateTimeStringFirst // YYYY-MM-DD HH:mm:ss
 * param {String} dateTimeStringSecond // YYYY-MM-DD HH:mm:ss
 * returns {Boolean}
 */
function areDatesIdentical(dateTimeStringFirst: string, dateTimeStringSecond: string): boolean {
    const date1 = parse(dateTimeStringFirst, 'yyyy-MM-dd HH:mm:ss', new Date());
    const date2 = parse(dateTimeStringSecond, 'yyyy-MM-dd HH:mm:ss', new Date());

    return isSameSecond(date1, date2);
}

/**
 * Checks if the time input is at least one minute in the future.
 * param {String} timeString: '04:24 AM'
 * param {String} dateTimeString: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
const isTimeAtLeastOneMinuteInFuture = ({timeString, dateTimeString}: {timeString?: string; dateTimeString: string}): boolean => {
    let dateToCheck = dateTimeString;
    if (timeString) {
        //  return false;
        // Parse the hour and minute from the time input
        const [hourStr] = timeString.split(/[:\s]+/);
        const hour = parseInt(hourStr, 10);

        if (hour === 0) {
            return false;
        }

        dateToCheck = combineDateAndTime(timeString, dateTimeString);
    }

    // Get current date and time
    const now = new Date();

    // Check if the combinedDate is at least one minute later than the current date and time
    return isAfter(new Date(dateToCheck), addMinutes(now, 1));
};

/**
 * Checks if the input date is in the future compared to the reference date.
 * param {Date} inputDate - The date to validate.
 * param {Date} referenceDate - The date to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
const getDayValidationErrorKey = (inputDate: Date): string => {
    if (!inputDate) {
        return '';
    }

    if (isAfter(startOfDay(new Date()), startOfDay(inputDate))) {
        return 'common.error.invalidDateShouldBeFuture';
    }
    return '';
};

/**
 * Checks if the input time is at least one minute in the future compared to the reference time.
 * param {Date} inputTime - The time to validate.
 * param {Date} referenceTime - The time to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
const getTimeValidationErrorKey = (inputTime: Date): string => {
    const timeNowPlusOneMinute = addMinutes(new Date(), 1);
    if (isBefore(inputTime, timeNowPlusOneMinute)) {
        return 'common.error.invalidTimeShouldBeFuture';
    }
    return '';
};

/**
 *
 * Get a date and format this date using the UTC timezone.
 * param datetime
 * param dateFormat
 * returns If the date is valid, returns the formatted date with the UTC timezone, otherwise returns an empty string.
 */
function formatWithUTCTimeZone(datetime: string, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING) {
    const date = new Date(datetime);

    if (isValid(date)) {
        return tzFormat(utcToZonedTime(date, 'UTC'), dateFormat);
    }

    return '';
}

/**
 *
 * @param timezone
 * function format unsupported timezone to supported timezone
 * @returns Timezone
 */
function formatToSupportedTimezone(timezoneInput: Timezone): Timezone {
    if (!timezoneInput?.selected) {
        return timezoneInput;
    }
    return {
        selected: timezoneBackwardMap[timezoneInput.selected] ?? timezoneInput.selected,
        automatic: timezoneInput.automatic,
    };
}

/**
 * Return the date with full format if the created date is the current date.
 * Otherwise return the created date.
 */
function enrichMoneyRequestTimestamp(created: string): string {
    const now = new Date();
    const createdDate = parse(created, CONST.DATE.FNS_FORMAT_STRING, now);
    return isSameDay(createdDate, now) ? getDBTimeFromDate(now) : created;
}
/**
 * Returns the last business day of given date month
 *
 * param {Date} inputDate
 * returns {number}
 */
function getLastBusinessDayOfMonth(inputDate: Date): number {
    let currentDate = endOfMonth(inputDate);
    const dayOfWeek = getDay(currentDate);

    if (dayOfWeek === 0) {
        currentDate = subDays(currentDate, 2);
    } else if (dayOfWeek === 6) {
        currentDate = subDays(currentDate, 1);
    }

    return getDate(currentDate);
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
    getDBTimeWithSkew,
    setLocale,
    subtractMillisecondsFromDateTime,
    addMillisecondsFromDateTime,
    getDateStringFromISOTimestamp,
    getThirtyMinutesFromNow,
    getEndOfToday,
    getOneWeekFromNow,
    getDateFromStatusType,
    getOneHourFromNow,
    extractDate,
    formatDateTimeTo12Hour,
    getStatusUntilDate,
    extractTime12Hour,
    get12HourTimeObjectFromDate,
    areDatesIdentical,
    getTimePeriod,
    getLocalizedTimePeriodDescription,
    combineDateAndTime,
    getDayValidationErrorKey,
    getTimeValidationErrorKey,
    isToday,
    isTomorrow,
    isYesterday,
    getMonthNames,
    getDaysOfWeek,
    formatWithUTCTimeZone,
    getWeekStartsOn,
    getWeekEndsOn,
    isTimeAtLeastOneMinuteInFuture,
    formatToSupportedTimezone,
    enrichMoneyRequestTimestamp,
    getLastBusinessDayOfMonth,
};

export default DateUtils;
