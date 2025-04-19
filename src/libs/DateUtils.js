'use strict';
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
var date_fns_1 = require('date-fns');
var date_fns_tz_1 = require('date-fns-tz');
var en_GB_1 = require('date-fns/locale/en-GB');
var es_1 = require('date-fns/locale/es');
var throttle_1 = require('lodash/throttle');
var react_native_onyx_1 = require('react-native-onyx');
var CONST_1 = require('@src/CONST');
var ONYXKEYS_1 = require('@src/ONYXKEYS');
var TIMEZONES_1 = require('@src/TIMEZONES');
var CurrentDate_1 = require('./actions/CurrentDate');
var Network_1 = require('./actions/Network');
var Localize_1 = require('./Localize');
var Log_1 = require('./Log');
var TIMEZONE_UPDATE_THROTTLE_MINUTES = 5;
var currentUserAccountID;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].SESSION,
    callback: function (val) {
        // When signed out, val is undefined
        if (!val) {
            return;
        }
        currentUserAccountID = val.accountID;
    },
});
var timezone = CONST_1['default'].DEFAULT_TIME_ZONE;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PERSONAL_DETAILS_LIST,
    callback: function (value) {
        var _a, _b, _c;
        if (!currentUserAccountID) {
            return;
        }
        var personalDetailsTimezone = (_a = value === null || value === void 0 ? void 0 : value[currentUserAccountID]) === null || _a === void 0 ? void 0 : _a.timezone;
        timezone = {
            selected:
                (_b = personalDetailsTimezone === null || personalDetailsTimezone === void 0 ? void 0 : personalDetailsTimezone.selected) !== null && _b !== void 0
                    ? _b
                    : CONST_1['default'].DEFAULT_TIME_ZONE.selected,
            automatic:
                (_c = personalDetailsTimezone === null || personalDetailsTimezone === void 0 ? void 0 : personalDetailsTimezone.automatic) !== null && _c !== void 0
                    ? _c
                    : CONST_1['default'].DEFAULT_TIME_ZONE.automatic,
        };
    },
});
var networkTimeSkew = 0;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NETWORK,
    callback: function (value) {
        var _a;
        return (networkTimeSkew = (_a = value === null || value === void 0 ? void 0 : value.timeSkew) !== null && _a !== void 0 ? _a : 0);
    },
});
var isOffline;
var preferredLocaleFromOnyx;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
    callback: function (value) {
        if (!value) {
            return;
        }
        preferredLocaleFromOnyx = value;
    },
});
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NETWORK,
    callback: function (val) {
        var _a;
        if (!(val === null || val === void 0 ? void 0 : val.lastOfflineAt)) {
            Network_1.setNetworkLastOffline(getLocalDateFromDatetime(preferredLocaleFromOnyx));
        }
        var newIsOffline = (_a = val === null || val === void 0 ? void 0 : val.isOffline) !== null && _a !== void 0 ? _a : val === null || val === void 0 ? void 0 : val.shouldForceOffline;
        if (newIsOffline && isOffline === false) {
            Network_1.setNetworkLastOffline(getLocalDateFromDatetime(preferredLocaleFromOnyx));
        }
        isOffline = newIsOffline;
    },
});
function isDate(arg) {
    return Object.prototype.toString.call(arg) === '[object Date]';
}
/**
 * Get the day of the week that the week starts on
 */
function getWeekStartsOn() {
    return CONST_1['default'].WEEK_STARTS_ON;
}
/**
 * Get the day of the week that the week ends on
 */
function getWeekEndsOn() {
    var weekStartsOn = getWeekStartsOn();
    return weekStartsOn === 0 ? 6 : weekStartsOn - 1;
}
/**
 * Gets the locale string and setting default locale for date-fns
 */
function setLocale(localeString) {
    switch (localeString) {
        case CONST_1['default'].LOCALES.EN:
            date_fns_1.setDefaultOptions({locale: en_GB_1.enGB});
            break;
        case CONST_1['default'].LOCALES.ES:
            date_fns_1.setDefaultOptions({locale: es_1.es});
            break;
        default:
            break;
    }
}
/**
 * Gets the user's stored time zone NVP and returns a localized
 * Date object for the given ISO-formatted datetime string
 */
function getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone) {
    if (currentSelectedTimezone === void 0) {
        currentSelectedTimezone = timezone.selected;
    }
    setLocale(locale);
    if (!datetime) {
        var res = date_fns_tz_1.toZonedTime(new Date(), currentSelectedTimezone);
        if (Number.isNaN(res.getTime())) {
            Log_1['default'].warn('DateUtils.getLocalDateFromDatetime: toZonedTime returned an invalid date. Returning current date.', {
                locale: locale,
                datetime: datetime,
                currentSelectedTimezone: currentSelectedTimezone,
            });
            return new Date();
        }
        return res;
    }
    var parsedDatetime;
    try {
        // in some cases we cannot add 'Z' to the date string
        parsedDatetime = new Date(datetime + 'Z');
        parsedDatetime.toISOString(); // we need to call toISOString because it throws RangeError in case of an invalid date
    } catch (e) {
        parsedDatetime = new Date(datetime);
    }
    return date_fns_tz_1.toZonedTime(parsedDatetime, currentSelectedTimezone);
}
/**
 * Checks if a given date is today in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is today; otherwise, false.
 */
function isToday(date, timeZone) {
    var currentDate = new Date();
    var currentDateInTimeZone = date_fns_tz_1.toZonedTime(currentDate, timeZone);
    return date_fns_1.isSameDay(date, currentDateInTimeZone);
}
/**
 * Checks if a given date is tomorrow in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is tomorrow; otherwise, false.
 */
function isTomorrow(date, timeZone) {
    var currentDate = new Date();
    var tomorrow = date_fns_1.addDays(currentDate, 1); // Get the date for tomorrow in the current time zone
    var tomorrowInTimeZone = date_fns_tz_1.toZonedTime(tomorrow, timeZone);
    return date_fns_1.isSameDay(date, tomorrowInTimeZone);
}
/**
 * Checks if a given date is yesterday in the specified time zone.
 *
 * @param date - The date to compare.
 * @param timeZone - The time zone to consider.
 * @returns True if the date is yesterday; otherwise, false.
 */
function isYesterday(date, timeZone) {
    var currentDate = new Date();
    var yesterday = date_fns_1.subDays(currentDate, 1); // Get the date for yesterday in the current time zone
    var yesterdayInTimeZone = date_fns_tz_1.toZonedTime(yesterday, timeZone);
    return date_fns_1.isSameDay(date, yesterdayInTimeZone);
}
/**
 * Formats an ISO-formatted datetime string to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 */
function datetimeToCalendarTime(locale, datetime, includeTimeZone, currentSelectedTimezone, isLowercase) {
    if (includeTimeZone === void 0) {
        includeTimeZone = false;
    }
    if (currentSelectedTimezone === void 0) {
        currentSelectedTimezone = timezone.selected;
    }
    if (isLowercase === void 0) {
        isLowercase = false;
    }
    var date = getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone);
    var tz = includeTimeZone ? ' [UTC]Z' : '';
    var todayAt = Localize_1.translate(locale, 'common.todayAt');
    var tomorrowAt = Localize_1.translate(locale, 'common.tomorrowAt');
    var yesterdayAt = Localize_1.translate(locale, 'common.yesterdayAt');
    var at = Localize_1.translate(locale, 'common.conjunctionAt');
    var weekStartsOn = getWeekStartsOn();
    var startOfCurrentWeek = date_fns_1.startOfWeek(new Date(), {weekStartsOn: weekStartsOn});
    var endOfCurrentWeek = date_fns_1.endOfWeek(new Date(), {weekStartsOn: weekStartsOn});
    if (isLowercase) {
        todayAt = todayAt.toLowerCase();
        tomorrowAt = tomorrowAt.toLowerCase();
        yesterdayAt = yesterdayAt.toLowerCase();
    }
    if (isToday(date, currentSelectedTimezone)) {
        return todayAt + ' ' + date_fns_1.format(date, CONST_1['default'].DATE.LOCAL_TIME_FORMAT) + tz;
    }
    if (isTomorrow(date, currentSelectedTimezone)) {
        return tomorrowAt + ' ' + date_fns_1.format(date, CONST_1['default'].DATE.LOCAL_TIME_FORMAT) + tz;
    }
    if (isYesterday(date, currentSelectedTimezone)) {
        return yesterdayAt + ' ' + date_fns_1.format(date, CONST_1['default'].DATE.LOCAL_TIME_FORMAT) + tz;
    }
    if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
        return date_fns_1.format(date, CONST_1['default'].DATE.MONTH_DAY_ABBR_FORMAT) + ' ' + at + ' ' + date_fns_1.format(date, CONST_1['default'].DATE.LOCAL_TIME_FORMAT) + tz;
    }
    return date_fns_1.format(date, CONST_1['default'].DATE.MONTH_DAY_YEAR_ABBR_FORMAT) + ' ' + at + ' ' + date_fns_1.format(date, CONST_1['default'].DATE.LOCAL_TIME_FORMAT) + tz;
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
function datetimeToRelative(locale, datetime) {
    var date = getLocalDateFromDatetime(locale, datetime);
    var now = getLocalDateFromDatetime(locale);
    return date_fns_1.formatDistance(date, now, {addSuffix: true, locale: locale === CONST_1['default'].LOCALES.EN ? en_GB_1.enGB : es_1.es});
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
function getZoneAbbreviation(datetime, selectedTimezone) {
    return date_fns_tz_1.formatInTimeZone(datetime, selectedTimezone, 'zzz');
}
/**
 * Format date to a long date format with weekday
 *
 * @returns Sunday, July 9, 2023
 */
function formatToLongDateWithWeekday(datetime) {
    return date_fns_1.format(new Date(datetime), CONST_1['default'].DATE.LONG_DATE_FORMAT_WITH_WEEKDAY);
}
/**
 * Format date to a weekday format
 *
 * @returns Sunday
 */
function formatToDayOfWeek(datetime) {
    return date_fns_1.format(datetime, CONST_1['default'].DATE.WEEKDAY_TIME_FORMAT);
}
/**
 * Format date to a local time
 *
 * @returns 2:30 PM
 */
function formatToLocalTime(datetime) {
    return date_fns_1.format(new Date(datetime), CONST_1['default'].DATE.LOCAL_TIME_FORMAT);
}
var THREE_HOURS = 1000 * 60 * 60 * 3;
/**
 * A throttled version of a function that updates the current date in Onyx store
 */
var updateCurrentDate = throttle_1['default'](function () {
    var currentDate = date_fns_1.format(new Date(), CONST_1['default'].DATE.FNS_FORMAT_STRING);
    CurrentDate_1.setCurrentDate(currentDate);
}, THREE_HOURS);
/**
 * Initialises the event listeners that trigger the current date update
 */
function startCurrentDateUpdater() {
    var trackedEvents = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    trackedEvents.forEach(function (eventName) {
        document.addEventListener(eventName, updateCurrentDate);
    });
}
function getCurrentTimezone() {
    var currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        return __assign(__assign({}, timezone), {selected: currentTimezone});
    }
    return timezone;
}
/**
 * @returns [January, Fabruary, March, April, May, June, July, August, ...]
 */
function getMonthNames(preferredLocale) {
    if (preferredLocale) {
        setLocale(preferredLocale);
    }
    var fullYear = new Date().getFullYear();
    var monthsArray = date_fns_1.eachMonthOfInterval({
        start: new Date(fullYear, 0, 1),
        end: new Date(fullYear, 11, 31),
    });
    return monthsArray.map(function (monthDate) {
        return date_fns_1.format(monthDate, CONST_1['default'].DATE.MONTH_FORMAT);
    });
}
/**
 * @returns [Monday, Thuesday, Wednesday, ...]
 */
function getDaysOfWeek(preferredLocale) {
    if (preferredLocale) {
        setLocale(preferredLocale);
    }
    var weekStartsOn = getWeekStartsOn();
    var startOfCurrentWeek = date_fns_1.startOfWeek(new Date(), {weekStartsOn: weekStartsOn});
    var endOfCurrentWeek = date_fns_1.endOfWeek(new Date(), {weekStartsOn: weekStartsOn});
    var daysOfWeek = date_fns_1.eachDayOfInterval({start: startOfCurrentWeek, end: endOfCurrentWeek});
    return daysOfWeek.map(function (date) {
        return date_fns_1.format(date, 'eeee');
    });
}
// Used to throttle updates to the timezone when necessary. Initialize outside the throttle window so it's updated the first time.
var lastUpdatedTimezoneTime = date_fns_1.subMinutes(new Date(), TIMEZONE_UPDATE_THROTTLE_MINUTES + 1);
function canUpdateTimezone() {
    var currentTime = new Date();
    var fiveMinutesAgo = date_fns_1.subMinutes(currentTime, TIMEZONE_UPDATE_THROTTLE_MINUTES);
    // Compare the last updated time with five minutes ago
    return date_fns_1.isBefore(lastUpdatedTimezoneTime, fiveMinutesAgo);
}
function setTimezoneUpdated() {
    lastUpdatedTimezoneTime = new Date();
}
/**
 * Get the UNIX timestamp in microseconds, with millisecond precision.
 */
function getMicroseconds() {
    return Date.now() * CONST_1['default'].MICROSECONDS_PER_MS;
}
function getDBTimeFromDate(date) {
    return date.toISOString().replace('T', ' ').replace('Z', '');
}
/**
 * Convert the given timestamp to the "yyyy-MM-dd HH:mm:ss" format, as expected by the database
 *
 * @param [timestamp] the given timestamp (if omitted, defaults to the current time)
 */
function getDBTime(timestamp) {
    if (timestamp === void 0) {
        timestamp = '';
    }
    var datetime = timestamp ? new Date(timestamp) : new Date();
    return getDBTimeFromDate(datetime);
}
/**
 * Returns the current time plus skew in milliseconds in the format expected by the database
 */
function getDBTimeWithSkew(timestamp) {
    if (timestamp === void 0) {
        timestamp = '';
    }
    if (networkTimeSkew > 0) {
        var datetime = timestamp ? new Date(timestamp) : new Date();
        return getDBTime(datetime.valueOf() + networkTimeSkew);
    }
    return getDBTime(timestamp);
}
function subtractMillisecondsFromDateTime(dateTime, milliseconds) {
    var date = date_fns_tz_1.fromZonedTime(dateTime, 'UTC');
    var newTimestamp = date_fns_1.subMilliseconds(date, milliseconds).valueOf();
    return getDBTime(newTimestamp);
}
function addMillisecondsFromDateTime(dateTime, milliseconds) {
    var date = date_fns_tz_1.fromZonedTime(dateTime, 'UTC');
    var newTimestamp = date_fns_1.addMilliseconds(date, milliseconds).valueOf();
    return getDBTime(newTimestamp);
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getThirtyMinutesFromNow() {
    var date = date_fns_1.addMinutes(new Date(), 30);
    return date_fns_1.format(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneHourFromNow() {
    var date = date_fns_1.addHours(new Date(), 1);
    return date_fns_1.format(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getEndOfToday() {
    var date = date_fns_1.endOfDay(new Date());
    return date_fns_1.format(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getStartOfToday() {
    var date = date_fns_1.startOfDay(new Date());
    return date_fns_1.format(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneWeekFromNow() {
    var date = date_fns_1.addDays(new Date(), 7);
    return date_fns_1.format(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16
 */
function extractDate(dateTimeString) {
    if (!dateTimeString) {
        return '';
    }
    if (dateTimeString === 'never') {
        return '';
    }
    var date = new Date(dateTimeString);
    return date_fns_1.format(date, 'yyyy-MM-dd');
}
/**
 * param {string} dateTimeString
 * returns {string} example: 11:10 PM
 */
function extractTime12Hour(dateTimeString, isFullFormat) {
    if (isFullFormat === void 0) {
        isFullFormat = false;
    }
    if (!dateTimeString || dateTimeString === 'never') {
        return '';
    }
    var date = new Date(dateTimeString);
    return date_fns_1.format(date, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a');
}
/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16 11:10 PM
 */
function formatDateTimeTo12Hour(dateTimeString) {
    if (!dateTimeString) {
        return '';
    }
    var date = new Date(dateTimeString);
    return date_fns_1.format(date, 'yyyy-MM-dd hh:mm a');
}
/**
 * param {string} type - one of the values from CONST.CUSTOM_STATUS_TYPES
 * returns {string} example: 2023-05-16 11:10:00 or ''
 */
function getDateFromStatusType(type) {
    switch (type) {
        case CONST_1['default'].CUSTOM_STATUS_TYPES.THIRTY_MINUTES:
            return getThirtyMinutesFromNow();
        case CONST_1['default'].CUSTOM_STATUS_TYPES.ONE_HOUR:
            return getOneHourFromNow();
        case CONST_1['default'].CUSTOM_STATUS_TYPES.AFTER_TODAY:
            return getEndOfToday();
        case CONST_1['default'].CUSTOM_STATUS_TYPES.AFTER_WEEK:
            return getOneWeekFromNow();
        case CONST_1['default'].CUSTOM_STATUS_TYPES.NEVER:
            return CONST_1['default'].CUSTOM_STATUS_TYPES.NEVER;
        default:
            return '';
    }
}
/**
 * param {string} data - either a value from CONST.CUSTOM_STATUS_TYPES or a dateTime string in the format YYYY-MM-DD HH:mm
 * returns {string} example: 2023-05-16 11:10 PM or 'Today'
 */
function getLocalizedTimePeriodDescription(data) {
    switch (data) {
        case getEndOfToday():
            return Localize_1.translateLocal('statusPage.timePeriods.afterToday');
        case CONST_1['default'].CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return Localize_1.translateLocal('statusPage.timePeriods.never');
        default:
            return formatDateTimeTo12Hour(data);
    }
}
/**
 * receive date like 2020-05-16 05:34:14 and format it to show in string like "Until 05:34 PM"
 */
function getStatusUntilDate(inputDate) {
    if (!inputDate) {
        return '';
    }
    var input = new Date(inputDate);
    var now = new Date();
    var endOfToday = date_fns_1.endOfDay(now);
    // If the date is adjusted to the following day
    if (date_fns_1.isSameSecond(input, endOfToday)) {
        return Localize_1.translateLocal('statusPage.untilTomorrow');
    }
    // If it's a time on the same date
    if (date_fns_1.isSameDay(input, now)) {
        return Localize_1.translateLocal('statusPage.untilTime', {time: date_fns_1.format(input, CONST_1['default'].DATE.LOCAL_TIME_FORMAT)});
    }
    // If it's further in the future than tomorrow but within the same year
    if (date_fns_1.isAfter(input, now) && date_fns_1.isSameYear(input, now)) {
        return Localize_1.translateLocal('statusPage.untilTime', {
            time: date_fns_1.format(input, CONST_1['default'].DATE.SHORT_DATE_FORMAT + ' ' + CONST_1['default'].DATE.LOCAL_TIME_FORMAT),
        });
    }
    // If it's in another year
    return Localize_1.translateLocal('statusPage.untilTime', {time: date_fns_1.format(input, CONST_1['default'].DATE.FNS_FORMAT_STRING + ' ' + CONST_1['default'].DATE.LOCAL_TIME_FORMAT)});
}
/**
 * Update the time for a given date.
 *
 * param {string} updatedTime - Time in "hh:mm A" or "HH:mm:ss" or "yyyy-MM-dd HH:mm:ss" format.
 * param {string} inputDateTime - Date in "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD" format.
 * returns {string} - Date with updated time in "YYYY-MM-DD HH:mm:ss" format.
 */
var combineDateAndTime = function (updatedTime, inputDateTime) {
    if (!updatedTime || !inputDateTime) {
        return '';
    }
    var parsedTime = null;
    if (updatedTime.includes('-')) {
        // it's in "yyyy-MM-dd HH:mm:ss" format
        var tempTime = date_fns_1.parse(updatedTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (date_fns_1.isValid(tempTime)) {
            parsedTime = tempTime;
        }
    } else if (updatedTime.includes(':')) {
        // it's in "hh:mm a" format
        var tempTime = date_fns_1.parse(updatedTime, 'hh:mm a', new Date());
        if (date_fns_1.isValid(tempTime)) {
            parsedTime = tempTime;
        }
    }
    if (!parsedTime) {
        return '';
    }
    var parsedDateTime = null;
    if (inputDateTime.includes(':')) {
        // Check if it includes time
        var tempDateTime = date_fns_1.parse(inputDateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if (date_fns_1.isValid(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    } else {
        var tempDateTime = date_fns_1.parse(inputDateTime, 'yyyy-MM-dd', new Date());
        if (date_fns_1.isValid(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    }
    if (!parsedDateTime) {
        return '';
    }
    var updatedDateTime = date_fns_1.set(parsedDateTime, {
        hours: parsedTime.getHours(),
        minutes: parsedTime.getMinutes(),
        seconds: parsedTime.getSeconds(),
    });
    return date_fns_1.format(updatedDateTime, 'yyyy-MM-dd HH:mm:ss');
};
/**
 * param {String} dateTime in 'HH:mm:ss.SSS a' format
 * returns {Object}
 * example {hour: '11', minute: '10', seconds: '10', milliseconds: '123', period: 'AM'}
 */
function get12HourTimeObjectFromDate(dateTime, isFullFormat) {
    if (isFullFormat === void 0) {
        isFullFormat = false;
    }
    if (!dateTime) {
        return {
            hour: '12',
            minute: '00',
            seconds: '00',
            milliseconds: '000',
            period: 'PM',
        };
    }
    var parsedTime = date_fns_1.parse(dateTime, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', new Date());
    return {
        hour: date_fns_1.format(parsedTime, 'hh'),
        minute: date_fns_1.format(parsedTime, 'mm'),
        seconds: isFullFormat ? date_fns_1.format(parsedTime, 'ss') : '00',
        milliseconds: isFullFormat ? date_fns_1.format(parsedTime, 'SSS') : '000',
        period: date_fns_1.format(parsedTime, 'a').toUpperCase(),
    };
}
/**
 * Checks if the time input is at least one minute in the future.
 * param {String} timeString: '04:24 AM'
 * param {String} dateTimeString: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
var isTimeAtLeastOneMinuteInFuture = function (_a) {
    var timeString = _a.timeString,
        dateTimeString = _a.dateTimeString;
    var dateToCheck = dateTimeString;
    if (timeString) {
        dateToCheck = combineDateAndTime(timeString, dateTimeString);
    }
    // Get current date and time
    var now = new Date();
    // Check if the combinedDate is at least one minute later than the current date and time
    return date_fns_1.isAfter(new Date(dateToCheck), date_fns_1.addMinutes(now, 1));
};
/**
 * Checks if the time range input is valid.
 * param {String} startTime: '2023-11-14 12:24:00'
 * param {String} endTime: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
var isValidStartEndTimeRange = function (_a) {
    var startTime = _a.startTime,
        endTime = _a.endTime;
    // Check if the combinedDate is at least one minute later than the current date and time
    return date_fns_1.isAfter(new Date(endTime), new Date(startTime));
};
/**
 * Checks if the input date is in the future compared to the reference date.
 * param {Date} inputDate - The date to validate.
 * param {Date} referenceDate - The date to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
var getDayValidationErrorKey = function (inputDate) {
    if (!inputDate) {
        return '';
    }
    if (date_fns_1.isAfter(date_fns_1.startOfDay(new Date()), date_fns_1.startOfDay(inputDate))) {
        return Localize_1.translateLocal('common.error.invalidDateShouldBeFuture');
    }
    return '';
};
/**
 * Checks if the input time is after the reference date
 * param {Date} inputDate - The date to validate.
 * returns {boolean} - Returns true if the input date is after the reference date, otherwise false.
 */
var isFutureDay = function (inputDate) {
    return date_fns_1.isAfter(date_fns_1.startOfDay(inputDate), date_fns_1.startOfDay(new Date()));
};
/**
 * Checks if the input time is at least one minute in the future compared to the reference time.
 * param {Date} inputTime - The time to validate.
 * param {Date} referenceTime - The time to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
var getTimeValidationErrorKey = function (inputTime) {
    var timeNowPlusOneMinute = date_fns_1.addMinutes(new Date(), 1);
    if (date_fns_1.isBefore(inputTime, timeNowPlusOneMinute)) {
        return Localize_1.translateLocal('common.error.invalidTimeShouldBeFuture');
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
function formatWithUTCTimeZone(datetime, dateFormat) {
    if (dateFormat === void 0) {
        dateFormat = CONST_1['default'].DATE.FNS_FORMAT_STRING;
    }
    var date = date_fns_tz_1.toDate(datetime, {timeZone: 'UTC'});
    if (date_fns_1.isValid(date)) {
        return date_fns_tz_1.format(date_fns_tz_1.toZonedTime(date, 'UTC'), dateFormat);
    }
    return '';
}
/**
 *
 * @param timezone
 * function format unsupported timezone to supported timezone
 * @returns Timezone
 */
function formatToSupportedTimezone(timezoneInput) {
    var _a;
    if (!(timezoneInput === null || timezoneInput === void 0 ? void 0 : timezoneInput.selected)) {
        return timezoneInput;
    }
    return {
        selected: (_a = TIMEZONES_1.timezoneBackwardMap[timezoneInput.selected]) !== null && _a !== void 0 ? _a : timezoneInput.selected,
        automatic: timezoneInput.automatic,
    };
}
/**
 * Returns the last business day of given date month
 *
 * param {Date} inputDate
 * returns {number}
 */
function getLastBusinessDayOfMonth(inputDate) {
    var currentDate = date_fns_1.endOfMonth(inputDate);
    var dayOfWeek = date_fns_1.getDay(currentDate);
    if (dayOfWeek === 0) {
        currentDate = date_fns_1.subDays(currentDate, 2);
    } else if (dayOfWeek === 6) {
        currentDate = date_fns_1.subDays(currentDate, 1);
    }
    return date_fns_1.getDate(currentDate);
}
/**
 * Returns a formatted date range from date 1 to date 2.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day: Mar 17
 * 2. When both dates refer to the same month: Mar 17-20
 * 3. When both dates refer to the same year: Feb 28 to Mar 1
 * 4. When the dates are from different years: Dec 28, 2023 to Jan 5, 2024
 */
function getFormattedDateRange(date1, date2) {
    if (date_fns_1.isSameDay(date1, date2)) {
        // Dates are from the same day
        return date_fns_1.format(date1, 'MMM d');
    }
    if (date_fns_1.isSameMonth(date1, date2)) {
        // Dates in the same month and year, differ by days
        return date_fns_1.format(date1, 'MMM d') + '-' + date_fns_1.format(date2, 'd');
    }
    if (date_fns_1.isSameYear(date1, date2)) {
        // Dates are in the same year, differ by months
        return date_fns_1.format(date1, 'MMM d') + ' ' + Localize_1.translateLocal('common.to').toLowerCase() + ' ' + date_fns_1.format(date2, 'MMM d');
    }
    // Dates differ by years, months, days
    return date_fns_1.format(date1, 'MMM d, yyyy') + ' ' + Localize_1.translateLocal('common.to').toLowerCase() + ' ' + date_fns_1.format(date2, 'MMM d, yyyy');
}
/**
 * Returns a formatted date range from date 1 to date 2 of a reservation.
 * Dates are formatted as follows:
 * 1. When both dates refer to the same day and the current year: Sunday, Mar 17
 * 2. When both dates refer to the same day but not the current year: Wednesday, Mar 17, 2023
 * 3. When both dates refer to the current year: Sunday, Mar 17 to Wednesday, Mar 20
 * 4. When the dates are from different years or from a year which is not current: Wednesday, Mar 17, 2023 to Saturday, Jan 20, 2024
 */
function getFormattedReservationRangeDate(date1, date2) {
    if (date_fns_1.isSameDay(date1, date2) && date_fns_1.isThisYear(date1)) {
        // Dates are from the same day
        return date_fns_1.format(date1, 'EEEE, MMM d');
    }
    if (date_fns_1.isSameDay(date1, date2)) {
        // Dates are from the same day but not this year
        return date_fns_1.format(date1, 'EEEE, MMM d, yyyy');
    }
    if (date_fns_1.isSameYear(date1, date2) && date_fns_1.isThisYear(date1)) {
        // Dates are in the current year, differ by months
        return date_fns_1.format(date1, 'EEEE, MMM d') + ' ' + Localize_1.translateLocal('common.conjunctionTo') + ' ' + date_fns_1.format(date2, 'EEEE, MMM d');
    }
    // Dates differ by years, months, days or only by months but the year is not current
    return date_fns_1.format(date1, 'EEEE, MMM d, yyyy') + ' ' + Localize_1.translateLocal('common.conjunctionTo') + ' ' + date_fns_1.format(date2, 'EEEE, MMM d, yyyy');
}
/**
 * Returns a formatted date of departure.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Departs on Sunday, Mar 17 at 8:00.
 * 2. When the date refers not to the current year: Departs on Wednesday, Mar 17, 2023 at 8:00.
 */
function getFormattedTransportDate(date) {
    if (date_fns_1.isThisYear(date)) {
        return (
            Localize_1.translateLocal('travel.departs') +
            ' ' +
            date_fns_1.format(date, 'EEEE, MMM d') +
            ' ' +
            Localize_1.translateLocal('common.conjunctionAt') +
            ' ' +
            date_fns_1.format(date, 'hh:mm a')
        );
    }
    return (
        Localize_1.translateLocal('travel.departs') +
        ' ' +
        date_fns_1.format(date, 'EEEE, MMM d, yyyy') +
        ' ' +
        Localize_1.translateLocal('common.conjunctionAt') +
        ' ' +
        date_fns_1.format(date, 'hh:mm a')
    );
}
/**
 * Returns a formatted flight date and hour.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function getFormattedTransportDateAndHour(date) {
    if (date_fns_1.isThisYear(date)) {
        return {
            date: date_fns_1.format(date, 'EEEE, MMM d'),
            hour: date_fns_1.format(date, 'h:mm a'),
        };
    }
    return {
        date: date_fns_1.format(date, 'EEEE, MMM d, yyyy'),
        hour: date_fns_1.format(date, 'h:mm a'),
    };
}
/**
 * Returns a formatted layover duration in format "2h 30m".
 */
function getFormattedDurationBetweenDates(translateParam, start, end) {
    var _a = date_fns_1.intervalToDuration({start: start, end: end}),
        days = _a.days,
        hours = _a.hours,
        minutes = _a.minutes;
    if (days && days > 0) {
        return;
    }
    return '' + (hours ? '' + hours + translateParam('common.hourAbbreviation') + ' ' : '') + minutes + translateParam('common.minuteAbbreviation');
}
function getFormattedDuration(translateParam, durationInSeconds) {
    var hours = Math.floor(durationInSeconds / 3600);
    var minutes = Math.floor((durationInSeconds % 3600) / 60);
    return '' + (hours ? '' + hours + translateParam('common.hourAbbreviation') + ' ' : '') + minutes + translateParam('common.minuteAbbreviation');
}
function doesDateBelongToAPastYear(date) {
    var transactionYear = new Date(date).getFullYear();
    return transactionYear !== new Date().getFullYear();
}
/**
 * Returns a boolean value indicating whether the card has expired.
 * @param expiryMonth month when card expires (starts from 1 so can be any number between 1 and 12)
 * @param expiryYear year when card expires
 */
function isCardExpired(expiryMonth, expiryYear) {
    var currentYear = new Date().getFullYear();
    var currentMonth = new Date().getMonth() + 1;
    return expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth);
}
/**
 * Returns the difference in the number of days from the provided date to/from now.
 * @param - The date to compare.
 * @returns The difference in days as an integer.
 */
function getDifferenceInDaysFromNow(date) {
    return date_fns_1.differenceInDays(new Date(), date);
}
/**
 * Returns a boolean value indicating whether the provided date string can be parsed as a valid date.
 * @param dateString string
 * @returns True if the date string is valid, otherwise false.
 */
function isValidDateString(dateString) {
    var date = new Date(dateString);
    return !Number.isNaN(date.getTime());
}
function getFormattedDateRangeForPerDiem(date1, date2) {
    return date_fns_1.format(date1, 'MMM d, yyyy') + ' - ' + date_fns_1.format(date2, 'MMM d, yyyy');
}
/**
 * Checks if the current time falls within the specified time range.
 */
var isCurrentTimeWithinRange = function (startTime, endTime) {
    var now = Date.now();
    return date_fns_1.isAfter(now, new Date(startTime)) && date_fns_1.isBefore(now, new Date(endTime));
};
var DateUtils = {
    isDate: isDate,
    formatToDayOfWeek: formatToDayOfWeek,
    formatToLongDateWithWeekday: formatToLongDateWithWeekday,
    formatToLocalTime: formatToLocalTime,
    getZoneAbbreviation: getZoneAbbreviation,
    datetimeToRelative: datetimeToRelative,
    datetimeToCalendarTime: datetimeToCalendarTime,
    startCurrentDateUpdater: startCurrentDateUpdater,
    getLocalDateFromDatetime: getLocalDateFromDatetime,
    getCurrentTimezone: getCurrentTimezone,
    canUpdateTimezone: canUpdateTimezone,
    setTimezoneUpdated: setTimezoneUpdated,
    getMicroseconds: getMicroseconds,
    getDBTime: getDBTime,
    getDBTimeWithSkew: getDBTimeWithSkew,
    setLocale: setLocale,
    subtractMillisecondsFromDateTime: subtractMillisecondsFromDateTime,
    addMillisecondsFromDateTime: addMillisecondsFromDateTime,
    getEndOfToday: getEndOfToday,
    getStartOfToday: getStartOfToday,
    getDateFromStatusType: getDateFromStatusType,
    getOneHourFromNow: getOneHourFromNow,
    extractDate: extractDate,
    getStatusUntilDate: getStatusUntilDate,
    extractTime12Hour: extractTime12Hour,
    formatDateTimeTo12Hour: formatDateTimeTo12Hour,
    get12HourTimeObjectFromDate: get12HourTimeObjectFromDate,
    getLocalizedTimePeriodDescription: getLocalizedTimePeriodDescription,
    combineDateAndTime: combineDateAndTime,
    getDayValidationErrorKey: getDayValidationErrorKey,
    getTimeValidationErrorKey: getTimeValidationErrorKey,
    isToday: isToday,
    isTomorrow: isTomorrow,
    isYesterday: isYesterday,
    getMonthNames: getMonthNames,
    getDaysOfWeek: getDaysOfWeek,
    formatWithUTCTimeZone: formatWithUTCTimeZone,
    getWeekEndsOn: getWeekEndsOn,
    isTimeAtLeastOneMinuteInFuture: isTimeAtLeastOneMinuteInFuture,
    isValidStartEndTimeRange: isValidStartEndTimeRange,
    formatToSupportedTimezone: formatToSupportedTimezone,
    getLastBusinessDayOfMonth: getLastBusinessDayOfMonth,
    getFormattedDateRange: getFormattedDateRange,
    getFormattedReservationRangeDate: getFormattedReservationRangeDate,
    getFormattedTransportDate: getFormattedTransportDate,
    getFormattedTransportDateAndHour: getFormattedTransportDateAndHour,
    doesDateBelongToAPastYear: doesDateBelongToAPastYear,
    isCardExpired: isCardExpired,
    getDifferenceInDaysFromNow: getDifferenceInDaysFromNow,
    isValidDateString: isValidDateString,
    getFormattedDurationBetweenDates: getFormattedDurationBetweenDates,
    getFormattedDuration: getFormattedDuration,
    isFutureDay: isFutureDay,
    getFormattedDateRangeForPerDiem: getFormattedDateRangeForPerDiem,
    isCurrentTimeWithinRange: isCurrentTimeWithinRange,
};
exports['default'] = DateUtils;
