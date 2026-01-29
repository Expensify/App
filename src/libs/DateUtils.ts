import {
    addDays,
    addHours,
    addMilliseconds,
    addMinutes,
    differenceInDays,
    eachDayOfInterval,
    eachMonthOfInterval,
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    formatDistance,
    getDate,
    getDay,
    intervalToDuration,
    isAfter,
    isBefore,
    isSameDay,
    isSameMonth,
    isSameSecond,
    isSameYear,
    isThisYear,
    isValid,
    parse,
    set,
    startOfDay,
    startOfWeek,
    subDays,
    subMilliseconds,
    subMinutes,
} from 'date-fns';
import {formatInTimeZone, fromZonedTime, toDate, toZonedTime, format as tzFormat} from 'date-fns-tz';
import throttle from 'lodash/throttle';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import {timezoneBackwardToNewMap, timezoneNewToBackwardMap} from '@src/TIMEZONES';
import type Locale from '@src/types/onyx/Locale';
import type {SelectedTimezone, Timezone} from '@src/types/onyx/PersonalDetails';
import {setCurrentDate} from './actions/CurrentDate';
import {translate as translateLocalize} from './Localize';
import Log from './Log';
import memoize from './memoize';

type CustomStatusTypes = ValueOf<typeof CONST.CUSTOM_STATUS_TYPES>;
type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const TIMEZONE_UPDATE_THROTTLE_MINUTES = 5;

function isDate(arg: unknown): arg is Date {
    return Object.prototype.toString.call(arg) === '[object Date]';
}

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
 * Gets the user's stored time zone NVP and returns a localized
 * Date object for the given ISO-formatted datetime string
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
function getLocalDateFromDatetime(locale: Locale | undefined, currentSelectedTimezone: string | SelectedTimezone, datetime?: string): Date {
    if (!datetime) {
        const res = toZonedTime(new Date(), currentSelectedTimezone);
        if (Number.isNaN(res.getTime())) {
            Log.warn('DateUtils.getLocalDateFromDatetime: toZonedTime returned an invalid date. Returning current date.', {
                locale,
                datetime,
                currentSelectedTimezone,
            });
            return new Date();
        }
        return res;
    }
    let parsedDatetime;
    try {
        // in some cases we cannot add 'Z' to the date string
        parsedDatetime = new Date(`${datetime}Z`);
        parsedDatetime.toISOString(); // we need to call toISOString because it throws RangeError in case of an invalid date
    } catch (e) {
        parsedDatetime = new Date(datetime);
    }

    return toZonedTime(parsedDatetime, currentSelectedTimezone);
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
    const currentDateInTimeZone = toZonedTime(currentDate, timeZone);
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
    const tomorrowInTimeZone = toZonedTime(tomorrow, timeZone);
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
    const yesterdayInTimeZone = toZonedTime(yesterday, timeZone);
    return isSameDay(date, yesterdayInTimeZone);
}

/**
 * We have to fall back to older timezone names for native platforms that do not ship with newer timezone names to avoid a crash.
 * Memoize to prevent unnecessary calculation as timezone support will not change on runtime on a platform.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const fallbackToSupportedTimezone = memoize((timezoneInput: SelectedTimezone): SelectedTimezone | string => {
    try {
        const date = new Date();
        const testDate = toZonedTime(date, timezoneInput);
        format(testDate, CONST.DATE.FNS_FORMAT_STRING);
        return timezoneInput;
    } catch (error) {
        return timezoneNewToBackwardMap[timezoneInput];
    }
});

/**
 * Formats an ISO-formatted datetime string to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 */
function datetimeToCalendarTime(locale: Locale | undefined, datetime: string, currentSelectedTimezone: SelectedTimezone, includeTimeZone = false, isLowercase = false): string {
    const date = getLocalDateFromDatetime(locale, fallbackToSupportedTimezone(currentSelectedTimezone), datetime);
    const tz = includeTimeZone ? ' [UTC]Z' : '';
    let todayAt = translateLocalize(locale, 'common.todayAt');
    let tomorrowAt = translateLocalize(locale, 'common.tomorrowAt');
    let yesterdayAt = translateLocalize(locale, 'common.yesterdayAt');
    const at = translateLocalize(locale, 'common.conjunctionAt');
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
function datetimeToRelative(locale: Locale | undefined, datetime: string, currentSelectedTimezone: SelectedTimezone): string {
    const date = getLocalDateFromDatetime(locale, currentSelectedTimezone, datetime);
    const now = getLocalDateFromDatetime(locale, currentSelectedTimezone);
    return formatDistance(date, now, {addSuffix: true});
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
    setCurrentDate(currentDate);
}, THREE_HOURS);

/**
 * Initialises the event listeners that trigger the current date update
 */
function startCurrentDateUpdater() {
    const trackedEvents = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    for (const eventName of trackedEvents) {
        document.addEventListener(eventName, updateCurrentDate);
    }
}

function getCurrentTimezone(timezone: Timezone): Required<Timezone> {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        return {...timezone, selected: currentTimezone as SelectedTimezone, automatic: timezone.automatic ?? false};
    }
    return {selected: timezone.selected ?? (CONST.DEFAULT_TIME_ZONE.selected as SelectedTimezone), automatic: timezone.automatic ?? false};
}

/**
 * @returns [January, February, March, April, May, June, July, August, ...]
 */
function getMonthNames(): string[] {
    const fullYear = new Date().getFullYear();
    const monthsArray = eachMonthOfInterval({
        start: new Date(fullYear, 0, 1), // January 1st of the current year
        end: new Date(fullYear, 11, 31), // December 31st of the current year
    });

    return monthsArray.map((monthDate) => format(monthDate, CONST.DATE.MONTH_FORMAT));
}

/**
 * @returns [Monday, Tuesday, Wednesday, ...]
 */
function getDaysOfWeek(): string[] {
    const weekStartsOn = getWeekStartsOn();
    const startOfCurrentWeek = startOfWeek(new Date(), {weekStartsOn});
    const endOfCurrentWeek = endOfWeek(new Date(), {weekStartsOn});
    const daysOfWeek = eachDayOfInterval({start: startOfCurrentWeek, end: endOfCurrentWeek});

    return daysOfWeek.map((date) => format(date, 'eeee'));
}

// Used to throttle updates to the timezone when necessary. Initialize outside the throttle window so it's updated the first time.
let lastUpdatedTimezoneTime = subMinutes(new Date(), TIMEZONE_UPDATE_THROTTLE_MINUTES + 1);

function canUpdateTimezone(): boolean {
    const currentTime = new Date();
    const fiveMinutesAgo = subMinutes(currentTime, TIMEZONE_UPDATE_THROTTLE_MINUTES);
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

function subtractMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = fromZonedTime(dateTime, 'UTC');
    const newTimestamp = subMilliseconds(date, milliseconds).valueOf();

    return getDBTime(newTimestamp);
}

function addMillisecondsFromDateTime(dateTime: string, milliseconds: number): string {
    const date = fromZonedTime(dateTime, 'UTC');
    const newTimestamp = addMilliseconds(date, milliseconds).valueOf();

    return getDBTime(newTimestamp);
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
function getStartOfToday(): string {
    const date = startOfDay(new Date());
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
function extractTime12Hour(dateTimeString: string, isFullFormat = false): string {
    if (!dateTimeString || dateTimeString === 'never') {
        return '';
    }
    const date = new Date(dateTimeString);
    return format(date, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a');
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
function getLocalizedTimePeriodDescription(translate: LocalizedTranslate, data: string): string {
    switch (data) {
        case getEndOfToday():
            return translate('statusPage.timePeriods.afterToday');
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return translate('statusPage.timePeriods.never');
        default:
            return formatDateTimeTo12Hour(data);
    }
}

/**
 * receive date like 2020-05-16 05:34:14 and format it to show in string like "Until 05:34 PM"
 * param {string} inputDate - Date string in 'YYYY-MM-DD HH:mm:ss' format representing the source time.
 * param {SelectedTimezone} inputDateTimeZone - Timezone in which the inputDate is provided.
 * param {SelectedTimezone} currentSelectedTimezone - Current user's timezone to display the result in.
 * returns {string} - A localized string such as 'Until 05:34 PM', 'Until tomorrow', or 'Until Jul 01 05:34 PM'.
 */
function getStatusUntilDate(translate: LocalizedTranslate, inputDate: string, inputDateTimeZone: SelectedTimezone, currentSelectedTimezone: SelectedTimezone): string {
    if (!inputDate) {
        return '';
    }

    const date = fromZonedTime(inputDate, inputDateTimeZone);
    const input = toZonedTime(date, currentSelectedTimezone);
    const now = toZonedTime(new Date(), currentSelectedTimezone);
    const endOfToday = endOfDay(now);

    // If the date is adjusted to the following day
    if (isSameSecond(input, endOfToday)) {
        return translate('statusPage.untilTomorrow');
    }

    // If it's a time on the same date
    if (isSameDay(input, now)) {
        return translate('statusPage.untilTime', {time: format(input, CONST.DATE.LOCAL_TIME_FORMAT)});
    }

    // If it's further in the future than tomorrow but within the same year
    if (isAfter(input, now) && isSameYear(input, now)) {
        return translate('statusPage.untilTime', {time: format(input, `${CONST.DATE.SHORT_DATE_FORMAT} ${CONST.DATE.LOCAL_TIME_FORMAT}`)});
    }

    // If it's in another year
    return translate('statusPage.untilTime', {time: format(input, `${CONST.DATE.FNS_FORMAT_STRING} ${CONST.DATE.LOCAL_TIME_FORMAT}`)});
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
 * param {String} dateTime in 'HH:mm:ss.SSS a' format
 * returns {Object}
 * example {hour: '11', minute: '10', seconds: '10', milliseconds: '123', period: 'AM'}
 */
function get12HourTimeObjectFromDate(dateTime: string, isFullFormat = false): {hour: string; minute: string; seconds: string; milliseconds: string; period: string} {
    if (!dateTime) {
        return {
            hour: '12',
            minute: '00',
            seconds: '00',
            milliseconds: '000',
            period: 'PM',
        };
    }
    const parsedTime = parse(dateTime, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', new Date());
    return {
        hour: format(parsedTime, 'hh'),
        minute: format(parsedTime, 'mm'),
        seconds: isFullFormat ? format(parsedTime, 'ss') : '00',
        milliseconds: isFullFormat ? format(parsedTime, 'SSS') : '000',
        period: format(parsedTime, 'a').toUpperCase(),
    };
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
        dateToCheck = combineDateAndTime(timeString, dateTimeString);
    }

    // Get current date and time
    const now = new Date();

    // Check if the combinedDate is at least one minute later than the current date and time
    return isAfter(new Date(dateToCheck), addMinutes(now, 1));
};

/**
 * Checks if the time range input is valid.
 * param {String} startTime: '2023-11-14 12:24:00'
 * param {String} endTime: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
const isValidStartEndTimeRange = ({startTime, endTime}: {startTime: string; endTime: string}): boolean => {
    // Check if the combinedDate is at least one minute later than the current date and time
    return isAfter(new Date(endTime), new Date(startTime));
};

/**
 * Checks if the input date is in the future compared to the reference date.
 * param {Date} inputDate - The date to validate.
 * param {Date} referenceDate - The date to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
const getDayValidationErrorKey = (translate: LocalizedTranslate, inputDate: Date): string => {
    if (!inputDate) {
        return '';
    }

    if (isAfter(startOfDay(new Date()), startOfDay(inputDate))) {
        return translate('common.error.invalidDateShouldBeFuture');
    }
    return '';
};

/**
 * Checks if the input time is after the reference date
 * param {Date} inputDate - The date to validate.
 * returns {boolean} - Returns true if the input date is after the reference date, otherwise false.
 */
const isFutureDay = (inputDate: Date): boolean => {
    return isAfter(startOfDay(inputDate), startOfDay(new Date()));
};

/**
 * Checks if the input time is at least one minute in the future compared to the reference time.
 * param {Date} inputTime - The time to validate.
 * param {Date} referenceTime - The time to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
const getTimeValidationErrorKey = (translate: LocalizedTranslate, inputTime: Date): string => {
    const timeNowPlusOneMinute = addMinutes(new Date(), 1);
    if (isBefore(inputTime, timeNowPlusOneMinute)) {
        return translate('common.error.invalidTimeShouldBeFuture');
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
    const date = toDate(datetime, {timeZone: 'UTC'});

    if (isValid(date)) {
        return tzFormat(toZonedTime(date, 'UTC'), dateFormat);
    }

    return '';
}

/**
 *
 * @param timezone
 * Convert unsupported old timezone to app supported timezone
 * @returns Timezone
 */
function formatToSupportedTimezone(timezoneInput: Timezone): Timezone {
    if (!timezoneInput?.selected) {
        return timezoneInput;
    }
    return {
        selected: timezoneBackwardToNewMap[timezoneInput.selected] ?? timezoneInput.selected,
        automatic: timezoneInput.automatic,
    };
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

/**
 * Returns a formatted date range from date 1 to date 2.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day: Mar 17
 * 2. When both dates refer to the same month: Mar 17-20
 * 3. When both dates refer to the same year: Feb 28 to Mar 1
 * 4. When the dates are from different years: Dec 28, 2023 to Jan 5, 2024
 */
function getFormattedDateRange(translate: LocalizedTranslate, date1: Date, date2: Date): string {
    if (isSameDay(date1, date2)) {
        // Dates are from the same day
        return format(date1, 'MMM d');
    }
    if (isSameMonth(date1, date2)) {
        // Dates in the same month and year, differ by days
        return `${format(date1, 'MMM d')}-${format(date2, 'd')}`;
    }
    if (isSameYear(date1, date2)) {
        // Dates are in the same year, differ by months
        return `${format(date1, 'MMM d')} ${translate('common.to').toLowerCase()} ${format(date2, 'MMM d')}`;
    }
    // Dates differ by years, months, days
    return `${format(date1, 'MMM d, yyyy')} ${translate('common.to').toLowerCase()} ${format(date2, 'MMM d, yyyy')}`;
}

/**
 * Returns a formatted date range from date 1 to date 2 of a reservation.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day and the current year: Sunday, Mar 17
 * 2. When both dates refer to the same day but not the current year: Wednesday, Mar 17, 2023
 * 3. When both dates refer to the current year: Sunday, Mar 17 to Wednesday, Mar 20
 * 4. When the dates are from different years or from a year which is not current: Wednesday, Mar 17, 2023 to Saturday, Jan 20, 2024
 */
function getFormattedReservationRangeDate(translate: LocalizedTranslate, date1: Date, date2: Date): string {
    if (isSameDay(date1, date2) && isThisYear(date1)) {
        // Dates are from the same day
        return format(date1, 'EEEE, MMM d');
    }
    if (isSameDay(date1, date2)) {
        // Dates are from the same day but not this year
        return format(date1, 'EEEE, MMM d, yyyy');
    }
    if (isSameYear(date1, date2) && isThisYear(date1)) {
        // Dates are in the current year, differ by months
        return `${format(date1, 'EEEE, MMM d')} ${translate('common.conjunctionTo')} ${format(date2, 'EEEE, MMM d')}`;
    }
    // Dates differ by years, months, days or only by months but the year is not current
    return `${format(date1, 'EEEE, MMM d, yyyy')} ${translate('common.conjunctionTo')} ${format(date2, 'EEEE, MMM d, yyyy')}`;
}

/**
 * Returns a formatted date of departure.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Departs on Sunday, Mar 17 at 8:00.
 * 2. When the date refers not to the current year: Departs on Wednesday, Mar 17, 2023 at 8:00.
 */
function getFormattedTransportDate(translate: LocalizedTranslate, date: Date): string {
    if (isThisYear(date)) {
        return `${translate('travel.departs')} ${format(date, 'EEEE, MMM d')} ${translate('common.conjunctionAt')} ${format(date, 'hh:mm a')}`;
    }
    return `${translate('travel.departs')} ${format(date, 'EEEE, MMM d, yyyy')} ${translate('common.conjunctionAt')} ${format(date, 'hh:mm a')}`;
}

/**
 * Returns a formatted flight date and hour.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function getFormattedTransportDateAndHour(date: Date): {date: string; hour: string} {
    if (isThisYear(date)) {
        return {
            date: format(date, 'EEEE, MMM d'),
            hour: format(date, 'h:mm a'),
        };
    }
    return {
        date: format(date, 'EEEE, MMM d, yyyy'),
        hour: format(date, 'h:mm a'),
    };
}

/**
 * Returns a formatted cancellation date.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function getFormattedCancellationDate(date: Date): string {
    if (isThisYear(date)) {
        return format(date, 'EEEE, MMM d h:mm a');
    }
    return format(date, 'EEEE, MMM d, yyyy h:mm a');
}

/**
 * Returns a formatted layover duration in format "2h 30m".
 */
function getFormattedDurationBetweenDates(translateParam: LocaleContextProps['translate'], start: Date, end: Date): string | undefined {
    const {days, hours, minutes} = intervalToDuration({start, end});

    if (days && days > 0) {
        return;
    }

    return `${hours ? `${hours}${translateParam('common.hourAbbreviation')} ` : ''}${minutes}${translateParam('common.minuteAbbreviation')}`;
}

function getFormattedDuration(translateParam: LocaleContextProps['translate'], durationInSeconds: number): string {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);

    return `${hours ? `${hours}${translateParam('common.hourAbbreviation')} ` : ''}${minutes}${translateParam('common.minuteAbbreviation')}`;
}

function doesDateBelongToAPastYear(date: string): boolean {
    const transactionYear = new Date(date).getFullYear();
    return transactionYear !== new Date().getFullYear();
}

/**
 * Returns a boolean value indicating whether the card has expired.
 * @param expiryMonth month when card expires (starts from 1 so can be any number between 1 and 12)
 * @param expiryYear year when card expires
 */

function isCardExpired(expiryMonth: number, expiryYear: number): boolean {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth);
}

/**
 * Returns the difference in the number of days from the provided date to/from now.
 * @param - The date to compare.
 * @returns The difference in days as an integer.
 */
function getDifferenceInDaysFromNow(date: Date) {
    return differenceInDays(new Date(), date);
}

/**
 * Returns a boolean value indicating whether the provided date string can be parsed as a valid date.
 * @param dateString string
 * @returns True if the date string is valid, otherwise false.
 */
function isValidDateString(dateString: string) {
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime());
}

function getFormattedDateRangeForPerDiem(date1: Date, date2: Date): string {
    return `${format(date1, 'MMM d, yyyy')} - ${format(date2, 'MMM d, yyyy')}`;
}

/**
 * Returns a formatted date range with the number of days in the range.
 * Format: "YYYY-MM-DD to YYYY-MM-DD (X days)"
 */
function getFormattedSplitDateRange(translateParam: LocaleContextProps['translate'], startDate: string | undefined, endDate: string | undefined): string {
    if (!startDate || !endDate) {
        return '';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = differenceInDays(end, start) + 1;

    return translateParam('iou.splitDateRange', {startDate, endDate, count: daysCount});
}

/**
 * Checks if the current time falls within the specified time range.
 */
const isCurrentTimeWithinRange = (startTime: string, endTime: string): boolean => {
    const now = Date.now();
    return isAfter(now, new Date(startTime)) && isBefore(now, new Date(endTime));
};

/**
 * Converts a date to a string in the format MMMM d, yyyy
 */
const formatToReadableString = (date: string): string => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'MMMM d, yyyy');
};

const formatInTimeZoneWithFallback: typeof formatInTimeZone = (date, timeZone, formatStr, options?) => {
    try {
        return formatInTimeZone(date, timeZone, formatStr, options);
        // On macOs and iOS devices some platform use deprecated old timezone values which results in invalid time string error.
        // Try with backward timezone values on error.
    } catch {
        return formatInTimeZone(date, timezoneNewToBackwardMap[timeZone as SelectedTimezone], formatStr, options);
    }
};

/**
 * Convert a date to UTC by taking midnight (00:00:00) in the user's local timezone and expressing it as a UTC timestamp
 */

const normalizeDateToStartOfDay = (fromDate: string): string => {
    const localDate = parse(fromDate, CONST.DATE.FNS_FORMAT_STRING, new Date());
    const midnightLocal = startOfDay(localDate);
    return getDBTime(midnightLocal.valueOf());
};

/**
 * Convert a date to UTC by taking end of day (23:59:59) in the user's local timezone and expressing it as a UTC timestamp
 */
const normalizeDateToEndOfDay = (thruDate: string): string => {
    const localDate = parse(thruDate, CONST.DATE.FNS_FORMAT_STRING, new Date());
    const endOfDayLocal = endOfDay(localDate);
    return getDBTime(endOfDayLocal.valueOf());
};

/**
 * Returns the start and end dates of a month in the format yyyy-MM-dd.
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12, where 1 is January)
 */
function getMonthDateRange(year: number, month: number): {start: string; end: string} {
    return {
        start: format(new Date(year, month - 1, 1), 'yyyy-MM-dd'),
        end: format(new Date(year, month, 0), 'yyyy-MM-dd'),
    };
}

/**
 * Checks if a date string (yyyy-MM-dd or yyyy-MM-dd HH:mm:ss) falls within a specific month.
 * Uses string comparison to avoid timezone issues.
 *
 * @param dateString - Date string in format yyyy-MM-dd or yyyy-MM-dd HH:mm:ss
 * @param year - Year (e.g., 2025)
 * @param month - Month (1-12, where 1 is January)
 */
function isDateStringInMonth(dateString: string, year: number, month: number): boolean {
    const datePart = dateString.substring(0, 10);
    const {start: monthStart, end: monthEnd} = getMonthDateRange(year, month);

    // String comparison works because yyyy-MM-dd format is lexicographically sortable
    return datePart >= monthStart && datePart <= monthEnd;
}

const DateUtils = {
    isDate,
    formatToDayOfWeek,
    formatToLongDateWithWeekday,
    formatToLocalTime,
    formatToReadableString,
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
    subtractMillisecondsFromDateTime,
    addMillisecondsFromDateTime,
    getEndOfToday,
    getStartOfToday,
    getDateFromStatusType,
    getOneHourFromNow,
    extractDate,
    getStatusUntilDate,
    extractTime12Hour,
    formatDateTimeTo12Hour,
    get12HourTimeObjectFromDate,
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
    getWeekEndsOn,
    isTimeAtLeastOneMinuteInFuture,
    isValidStartEndTimeRange,
    formatToSupportedTimezone,
    getLastBusinessDayOfMonth,
    getFormattedDateRange,
    getFormattedReservationRangeDate,
    getFormattedTransportDate,
    getFormattedTransportDateAndHour,
    getFormattedCancellationDate,
    doesDateBelongToAPastYear,
    isCardExpired,
    getDifferenceInDaysFromNow,
    isValidDateString,
    getFormattedDurationBetweenDates,
    getFormattedDuration,
    isFutureDay,
    getFormattedDateRangeForPerDiem,
    getFormattedSplitDateRange,
    isCurrentTimeWithinRange,
    formatInTimeZoneWithFallback,
    normalizeDateToStartOfDay,
    normalizeDateToEndOfDay,
    getMonthDateRange,
    isDateStringInMonth,
};

export default DateUtils;
