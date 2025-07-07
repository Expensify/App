"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var throttle_1 = require("lodash/throttle");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TIMEZONES_1 = require("@src/TIMEZONES");
var CurrentDate_1 = require("./actions/CurrentDate");
var Network_1 = require("./actions/Network");
var Localize_1 = require("./Localize");
var Log_1 = require("./Log");
var memoize_1 = require("./memoize");
var TIMEZONE_UPDATE_THROTTLE_MINUTES = 5;
var currentUserAccountID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        // When signed out, val is undefined
        if (!val) {
            return;
        }
        currentUserAccountID = val.accountID;
    },
});
var timezone = CONST_1.default.DEFAULT_TIME_ZONE;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) {
        var _a, _b, _c;
        if (!currentUserAccountID) {
            return;
        }
        var personalDetailsTimezone = (_a = value === null || value === void 0 ? void 0 : value[currentUserAccountID]) === null || _a === void 0 ? void 0 : _a.timezone;
        timezone = {
            selected: (_b = personalDetailsTimezone === null || personalDetailsTimezone === void 0 ? void 0 : personalDetailsTimezone.selected) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_TIME_ZONE.selected,
            automatic: (_c = personalDetailsTimezone === null || personalDetailsTimezone === void 0 ? void 0 : personalDetailsTimezone.automatic) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_TIME_ZONE.automatic,
        };
    },
});
var networkTimeSkew = 0;
var isOffline;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NETWORK,
    callback: function (val) {
        var _a, _b;
        networkTimeSkew = (_a = val === null || val === void 0 ? void 0 : val.timeSkew) !== null && _a !== void 0 ? _a : 0;
        if (!(val === null || val === void 0 ? void 0 : val.lastOfflineAt)) {
            (0, Network_1.setNetworkLastOffline)(getLocalDateFromDatetime(IntlStore_1.default.getCurrentLocale()));
        }
        var newIsOffline = (_b = val === null || val === void 0 ? void 0 : val.isOffline) !== null && _b !== void 0 ? _b : val === null || val === void 0 ? void 0 : val.shouldForceOffline;
        if (newIsOffline && isOffline === false) {
            (0, Network_1.setNetworkLastOffline)(getLocalDateFromDatetime(IntlStore_1.default.getCurrentLocale()));
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
    return CONST_1.default.WEEK_STARTS_ON;
}
/**
 * Get the day of the week that the week ends on
 */
function getWeekEndsOn() {
    var weekStartsOn = getWeekStartsOn();
    return weekStartsOn === 0 ? 6 : (weekStartsOn - 1);
}
/**
 * Gets the user's stored time zone NVP and returns a localized
 * Date object for the given ISO-formatted datetime string
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
function getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone) {
    if (currentSelectedTimezone === void 0) { currentSelectedTimezone = timezone.selected; }
    if (!datetime) {
        var res = (0, date_fns_tz_1.toZonedTime)(new Date(), currentSelectedTimezone);
        if (Number.isNaN(res.getTime())) {
            Log_1.default.warn('DateUtils.getLocalDateFromDatetime: toZonedTime returned an invalid date. Returning current date.', {
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
        parsedDatetime = new Date("".concat(datetime, "Z"));
        parsedDatetime.toISOString(); // we need to call toISOString because it throws RangeError in case of an invalid date
    }
    catch (e) {
        parsedDatetime = new Date(datetime);
    }
    return (0, date_fns_tz_1.toZonedTime)(parsedDatetime, currentSelectedTimezone);
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
    var currentDateInTimeZone = (0, date_fns_tz_1.toZonedTime)(currentDate, timeZone);
    return (0, date_fns_1.isSameDay)(date, currentDateInTimeZone);
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
    var tomorrow = (0, date_fns_1.addDays)(currentDate, 1); // Get the date for tomorrow in the current time zone
    var tomorrowInTimeZone = (0, date_fns_tz_1.toZonedTime)(tomorrow, timeZone);
    return (0, date_fns_1.isSameDay)(date, tomorrowInTimeZone);
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
    var yesterday = (0, date_fns_1.subDays)(currentDate, 1); // Get the date for yesterday in the current time zone
    var yesterdayInTimeZone = (0, date_fns_tz_1.toZonedTime)(yesterday, timeZone);
    return (0, date_fns_1.isSameDay)(date, yesterdayInTimeZone);
}
/**
 * We have to fall back to older timezone names for native platforms that do not ship with newer timezone names to avoid a crash.
 * Memoize to prevent unnecessary calculation as timezone support will not change on runtime on a platform.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
var fallbackToSupportedTimezone = (0, memoize_1.default)(function (timezoneInput) {
    try {
        var date = new Date();
        var testDate = (0, date_fns_tz_1.toZonedTime)(date, timezoneInput);
        (0, date_fns_1.format)(testDate, CONST_1.default.DATE.FNS_FORMAT_STRING);
        return timezoneInput;
    }
    catch (error) {
        return TIMEZONES_1.timezoneNewToBackwardMap[timezoneInput];
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
function datetimeToCalendarTime(locale, datetime, includeTimeZone, currentSelectedTimezone, isLowercase) {
    if (includeTimeZone === void 0) { includeTimeZone = false; }
    if (currentSelectedTimezone === void 0) { currentSelectedTimezone = timezone.selected; }
    if (isLowercase === void 0) { isLowercase = false; }
    var date = getLocalDateFromDatetime(locale, datetime, fallbackToSupportedTimezone(currentSelectedTimezone));
    var tz = includeTimeZone ? ' [UTC]Z' : '';
    var todayAt = (0, Localize_1.translate)(locale, 'common.todayAt');
    var tomorrowAt = (0, Localize_1.translate)(locale, 'common.tomorrowAt');
    var yesterdayAt = (0, Localize_1.translate)(locale, 'common.yesterdayAt');
    var at = (0, Localize_1.translate)(locale, 'common.conjunctionAt');
    var weekStartsOn = getWeekStartsOn();
    var startOfCurrentWeek = (0, date_fns_1.startOfWeek)(new Date(), { weekStartsOn: weekStartsOn });
    var endOfCurrentWeek = (0, date_fns_1.endOfWeek)(new Date(), { weekStartsOn: weekStartsOn });
    if (isLowercase) {
        todayAt = todayAt.toLowerCase();
        tomorrowAt = tomorrowAt.toLowerCase();
        yesterdayAt = yesterdayAt.toLowerCase();
    }
    if (isToday(date, currentSelectedTimezone)) {
        return "".concat(todayAt, " ").concat((0, date_fns_1.format)(date, CONST_1.default.DATE.LOCAL_TIME_FORMAT)).concat(tz);
    }
    if (isTomorrow(date, currentSelectedTimezone)) {
        return "".concat(tomorrowAt, " ").concat((0, date_fns_1.format)(date, CONST_1.default.DATE.LOCAL_TIME_FORMAT)).concat(tz);
    }
    if (isYesterday(date, currentSelectedTimezone)) {
        return "".concat(yesterdayAt, " ").concat((0, date_fns_1.format)(date, CONST_1.default.DATE.LOCAL_TIME_FORMAT)).concat(tz);
    }
    if (date >= startOfCurrentWeek && date <= endOfCurrentWeek) {
        return "".concat((0, date_fns_1.format)(date, CONST_1.default.DATE.MONTH_DAY_ABBR_FORMAT), " ").concat(at, " ").concat((0, date_fns_1.format)(date, CONST_1.default.DATE.LOCAL_TIME_FORMAT)).concat(tz);
    }
    return "".concat((0, date_fns_1.format)(date, CONST_1.default.DATE.MONTH_DAY_YEAR_ABBR_FORMAT), " ").concat(at, " ").concat((0, date_fns_1.format)(date, CONST_1.default.DATE.LOCAL_TIME_FORMAT)).concat(tz);
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
    return (0, date_fns_1.formatDistance)(date, now, { addSuffix: true });
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
    return (0, date_fns_tz_1.formatInTimeZone)(datetime, selectedTimezone, 'zzz');
}
/**
 * Format date to a long date format with weekday
 *
 * @returns Sunday, July 9, 2023
 */
function formatToLongDateWithWeekday(datetime) {
    return (0, date_fns_1.format)(new Date(datetime), CONST_1.default.DATE.LONG_DATE_FORMAT_WITH_WEEKDAY);
}
/**
 * Format date to a weekday format
 *
 * @returns Sunday
 */
function formatToDayOfWeek(datetime) {
    return (0, date_fns_1.format)(datetime, CONST_1.default.DATE.WEEKDAY_TIME_FORMAT);
}
/**
 * Format date to a local time
 *
 * @returns 2:30 PM
 */
function formatToLocalTime(datetime) {
    return (0, date_fns_1.format)(new Date(datetime), CONST_1.default.DATE.LOCAL_TIME_FORMAT);
}
var THREE_HOURS = 1000 * 60 * 60 * 3;
/**
 * A throttled version of a function that updates the current date in Onyx store
 */
var updateCurrentDate = (0, throttle_1.default)(function () {
    var currentDate = (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING);
    (0, CurrentDate_1.setCurrentDate)(currentDate);
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
        return __assign(__assign({}, timezone), { selected: currentTimezone });
    }
    return timezone;
}
/**
 * @returns [January, February, March, April, May, June, July, August, ...]
 */
function getMonthNames() {
    var fullYear = new Date().getFullYear();
    var monthsArray = (0, date_fns_1.eachMonthOfInterval)({
        start: new Date(fullYear, 0, 1), // January 1st of the current year
        end: new Date(fullYear, 11, 31), // December 31st of the current year
    });
    return monthsArray.map(function (monthDate) { return (0, date_fns_1.format)(monthDate, CONST_1.default.DATE.MONTH_FORMAT); });
}
/**
 * @returns [Monday, Tuesday, Wednesday, ...]
 */
function getDaysOfWeek() {
    var weekStartsOn = getWeekStartsOn();
    var startOfCurrentWeek = (0, date_fns_1.startOfWeek)(new Date(), { weekStartsOn: weekStartsOn });
    var endOfCurrentWeek = (0, date_fns_1.endOfWeek)(new Date(), { weekStartsOn: weekStartsOn });
    var daysOfWeek = (0, date_fns_1.eachDayOfInterval)({ start: startOfCurrentWeek, end: endOfCurrentWeek });
    return daysOfWeek.map(function (date) { return (0, date_fns_1.format)(date, 'eeee'); });
}
// Used to throttle updates to the timezone when necessary. Initialize outside the throttle window so it's updated the first time.
var lastUpdatedTimezoneTime = (0, date_fns_1.subMinutes)(new Date(), TIMEZONE_UPDATE_THROTTLE_MINUTES + 1);
function canUpdateTimezone() {
    var currentTime = new Date();
    var fiveMinutesAgo = (0, date_fns_1.subMinutes)(currentTime, TIMEZONE_UPDATE_THROTTLE_MINUTES);
    // Compare the last updated time with five minutes ago
    return (0, date_fns_1.isBefore)(lastUpdatedTimezoneTime, fiveMinutesAgo);
}
function setTimezoneUpdated() {
    lastUpdatedTimezoneTime = new Date();
}
/**
 * Get the UNIX timestamp in microseconds, with millisecond precision.
 */
function getMicroseconds() {
    return Date.now() * CONST_1.default.MICROSECONDS_PER_MS;
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
    if (timestamp === void 0) { timestamp = ''; }
    var datetime = timestamp ? new Date(timestamp) : new Date();
    return getDBTimeFromDate(datetime);
}
/**
 * Returns the current time plus skew in milliseconds in the format expected by the database
 */
function getDBTimeWithSkew(timestamp) {
    if (timestamp === void 0) { timestamp = ''; }
    if (networkTimeSkew > 0) {
        var datetime = timestamp ? new Date(timestamp) : new Date();
        return getDBTime(datetime.valueOf() + networkTimeSkew);
    }
    return getDBTime(timestamp);
}
function subtractMillisecondsFromDateTime(dateTime, milliseconds) {
    var date = (0, date_fns_tz_1.fromZonedTime)(dateTime, 'UTC');
    var newTimestamp = (0, date_fns_1.subMilliseconds)(date, milliseconds).valueOf();
    return getDBTime(newTimestamp);
}
function addMillisecondsFromDateTime(dateTime, milliseconds) {
    var date = (0, date_fns_tz_1.fromZonedTime)(dateTime, 'UTC');
    var newTimestamp = (0, date_fns_1.addMilliseconds)(date, milliseconds).valueOf();
    return getDBTime(newTimestamp);
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getThirtyMinutesFromNow() {
    var date = (0, date_fns_1.addMinutes)(new Date(), 30);
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneHourFromNow() {
    var date = (0, date_fns_1.addHours)(new Date(), 1);
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getEndOfToday() {
    var date = (0, date_fns_1.endOfDay)(new Date());
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getStartOfToday() {
    var date = (0, date_fns_1.startOfDay)(new Date());
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
}
/**
 * returns {string} example: 2023-05-16 05:34:14
 */
function getOneWeekFromNow() {
    var date = (0, date_fns_1.addDays)(new Date(), 7);
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd HH:mm:ss');
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
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd');
}
/**
 * param {string} dateTimeString
 * returns {string} example: 11:10 PM
 */
function extractTime12Hour(dateTimeString, isFullFormat) {
    if (isFullFormat === void 0) { isFullFormat = false; }
    if (!dateTimeString || dateTimeString === 'never') {
        return '';
    }
    var date = new Date(dateTimeString);
    return (0, date_fns_1.format)(date, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a');
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
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd hh:mm a');
}
/**
 * param {string} type - one of the values from CONST.CUSTOM_STATUS_TYPES
 * returns {string} example: 2023-05-16 11:10:00 or ''
 */
function getDateFromStatusType(type) {
    switch (type) {
        case CONST_1.default.CUSTOM_STATUS_TYPES.THIRTY_MINUTES:
            return getThirtyMinutesFromNow();
        case CONST_1.default.CUSTOM_STATUS_TYPES.ONE_HOUR:
            return getOneHourFromNow();
        case CONST_1.default.CUSTOM_STATUS_TYPES.AFTER_TODAY:
            return getEndOfToday();
        case CONST_1.default.CUSTOM_STATUS_TYPES.AFTER_WEEK:
            return getOneWeekFromNow();
        case CONST_1.default.CUSTOM_STATUS_TYPES.NEVER:
            return CONST_1.default.CUSTOM_STATUS_TYPES.NEVER;
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
            return (0, Localize_1.translateLocal)('statusPage.timePeriods.afterToday');
        case CONST_1.default.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return (0, Localize_1.translateLocal)('statusPage.timePeriods.never');
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
    var endOfToday = (0, date_fns_1.endOfDay)(now);
    // If the date is adjusted to the following day
    if ((0, date_fns_1.isSameSecond)(input, endOfToday)) {
        return (0, Localize_1.translateLocal)('statusPage.untilTomorrow');
    }
    // If it's a time on the same date
    if ((0, date_fns_1.isSameDay)(input, now)) {
        return (0, Localize_1.translateLocal)('statusPage.untilTime', { time: (0, date_fns_1.format)(input, CONST_1.default.DATE.LOCAL_TIME_FORMAT) });
    }
    // If it's further in the future than tomorrow but within the same year
    if ((0, date_fns_1.isAfter)(input, now) && (0, date_fns_1.isSameYear)(input, now)) {
        return (0, Localize_1.translateLocal)('statusPage.untilTime', { time: (0, date_fns_1.format)(input, "".concat(CONST_1.default.DATE.SHORT_DATE_FORMAT, " ").concat(CONST_1.default.DATE.LOCAL_TIME_FORMAT)) });
    }
    // If it's in another year
    return (0, Localize_1.translateLocal)('statusPage.untilTime', { time: (0, date_fns_1.format)(input, "".concat(CONST_1.default.DATE.FNS_FORMAT_STRING, " ").concat(CONST_1.default.DATE.LOCAL_TIME_FORMAT)) });
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
        var tempTime = (0, date_fns_1.parse)(updatedTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if ((0, date_fns_1.isValid)(tempTime)) {
            parsedTime = tempTime;
        }
    }
    else if (updatedTime.includes(':')) {
        // it's in "hh:mm a" format
        var tempTime = (0, date_fns_1.parse)(updatedTime, 'hh:mm a', new Date());
        if ((0, date_fns_1.isValid)(tempTime)) {
            parsedTime = tempTime;
        }
    }
    if (!parsedTime) {
        return '';
    }
    var parsedDateTime = null;
    if (inputDateTime.includes(':')) {
        // Check if it includes time
        var tempDateTime = (0, date_fns_1.parse)(inputDateTime, 'yyyy-MM-dd HH:mm:ss', new Date());
        if ((0, date_fns_1.isValid)(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    }
    else {
        var tempDateTime = (0, date_fns_1.parse)(inputDateTime, 'yyyy-MM-dd', new Date());
        if ((0, date_fns_1.isValid)(tempDateTime)) {
            parsedDateTime = tempDateTime;
        }
    }
    if (!parsedDateTime) {
        return '';
    }
    var updatedDateTime = (0, date_fns_1.set)(parsedDateTime, {
        hours: parsedTime.getHours(),
        minutes: parsedTime.getMinutes(),
        seconds: parsedTime.getSeconds(),
    });
    return (0, date_fns_1.format)(updatedDateTime, 'yyyy-MM-dd HH:mm:ss');
};
/**
 * param {String} dateTime in 'HH:mm:ss.SSS a' format
 * returns {Object}
 * example {hour: '11', minute: '10', seconds: '10', milliseconds: '123', period: 'AM'}
 */
function get12HourTimeObjectFromDate(dateTime, isFullFormat) {
    if (isFullFormat === void 0) { isFullFormat = false; }
    if (!dateTime) {
        return {
            hour: '12',
            minute: '00',
            seconds: '00',
            milliseconds: '000',
            period: 'PM',
        };
    }
    var parsedTime = (0, date_fns_1.parse)(dateTime, isFullFormat ? 'hh:mm:ss.SSS a' : 'hh:mm a', new Date());
    return {
        hour: (0, date_fns_1.format)(parsedTime, 'hh'),
        minute: (0, date_fns_1.format)(parsedTime, 'mm'),
        seconds: isFullFormat ? (0, date_fns_1.format)(parsedTime, 'ss') : '00',
        milliseconds: isFullFormat ? (0, date_fns_1.format)(parsedTime, 'SSS') : '000',
        period: (0, date_fns_1.format)(parsedTime, 'a').toUpperCase(),
    };
}
/**
 * Checks if the time input is at least one minute in the future.
 * param {String} timeString: '04:24 AM'
 * param {String} dateTimeString: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
var isTimeAtLeastOneMinuteInFuture = function (_a) {
    var timeString = _a.timeString, dateTimeString = _a.dateTimeString;
    var dateToCheck = dateTimeString;
    if (timeString) {
        dateToCheck = combineDateAndTime(timeString, dateTimeString);
    }
    // Get current date and time
    var now = new Date();
    // Check if the combinedDate is at least one minute later than the current date and time
    return (0, date_fns_1.isAfter)(new Date(dateToCheck), (0, date_fns_1.addMinutes)(now, 1));
};
/**
 * Checks if the time range input is valid.
 * param {String} startTime: '2023-11-14 12:24:00'
 * param {String} endTime: '2023-11-14 14:24:00'
 * returns {Boolean}
 */
var isValidStartEndTimeRange = function (_a) {
    var startTime = _a.startTime, endTime = _a.endTime;
    // Check if the combinedDate is at least one minute later than the current date and time
    return (0, date_fns_1.isAfter)(new Date(endTime), new Date(startTime));
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
    if ((0, date_fns_1.isAfter)((0, date_fns_1.startOfDay)(new Date()), (0, date_fns_1.startOfDay)(inputDate))) {
        return (0, Localize_1.translateLocal)('common.error.invalidDateShouldBeFuture');
    }
    return '';
};
/**
 * Checks if the input time is after the reference date
 * param {Date} inputDate - The date to validate.
 * returns {boolean} - Returns true if the input date is after the reference date, otherwise false.
 */
var isFutureDay = function (inputDate) {
    return (0, date_fns_1.isAfter)((0, date_fns_1.startOfDay)(inputDate), (0, date_fns_1.startOfDay)(new Date()));
};
/**
 * Checks if the input time is at least one minute in the future compared to the reference time.
 * param {Date} inputTime - The time to validate.
 * param {Date} referenceTime - The time to compare against.
 * returns {string} - Returns an error key if validation fails, otherwise an empty string.
 */
var getTimeValidationErrorKey = function (inputTime) {
    var timeNowPlusOneMinute = (0, date_fns_1.addMinutes)(new Date(), 1);
    if ((0, date_fns_1.isBefore)(inputTime, timeNowPlusOneMinute)) {
        return (0, Localize_1.translateLocal)('common.error.invalidTimeShouldBeFuture');
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
    if (dateFormat === void 0) { dateFormat = CONST_1.default.DATE.FNS_FORMAT_STRING; }
    var date = (0, date_fns_tz_1.toDate)(datetime, { timeZone: 'UTC' });
    if ((0, date_fns_1.isValid)(date)) {
        return (0, date_fns_tz_1.format)((0, date_fns_tz_1.toZonedTime)(date, 'UTC'), dateFormat);
    }
    return '';
}
/**
 *
 * @param timezone
 * Convert unsupported old timezone to app supported timezone
 * @returns Timezone
 */
function formatToSupportedTimezone(timezoneInput) {
    var _a;
    if (!(timezoneInput === null || timezoneInput === void 0 ? void 0 : timezoneInput.selected)) {
        return timezoneInput;
    }
    return {
        selected: (_a = TIMEZONES_1.timezoneBackwardToNewMap[timezoneInput.selected]) !== null && _a !== void 0 ? _a : timezoneInput.selected,
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
    var currentDate = (0, date_fns_1.endOfMonth)(inputDate);
    var dayOfWeek = (0, date_fns_1.getDay)(currentDate);
    if (dayOfWeek === 0) {
        currentDate = (0, date_fns_1.subDays)(currentDate, 2);
    }
    else if (dayOfWeek === 6) {
        currentDate = (0, date_fns_1.subDays)(currentDate, 1);
    }
    return (0, date_fns_1.getDate)(currentDate);
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
    if ((0, date_fns_1.isSameDay)(date1, date2)) {
        // Dates are from the same day
        return (0, date_fns_1.format)(date1, 'MMM d');
    }
    if ((0, date_fns_1.isSameMonth)(date1, date2)) {
        // Dates in the same month and year, differ by days
        return "".concat((0, date_fns_1.format)(date1, 'MMM d'), "-").concat((0, date_fns_1.format)(date2, 'd'));
    }
    if ((0, date_fns_1.isSameYear)(date1, date2)) {
        // Dates are in the same year, differ by months
        return "".concat((0, date_fns_1.format)(date1, 'MMM d'), " ").concat((0, Localize_1.translateLocal)('common.to').toLowerCase(), " ").concat((0, date_fns_1.format)(date2, 'MMM d'));
    }
    // Dates differ by years, months, days
    return "".concat((0, date_fns_1.format)(date1, 'MMM d, yyyy'), " ").concat((0, Localize_1.translateLocal)('common.to').toLowerCase(), " ").concat((0, date_fns_1.format)(date2, 'MMM d, yyyy'));
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
    if ((0, date_fns_1.isSameDay)(date1, date2) && (0, date_fns_1.isThisYear)(date1)) {
        // Dates are from the same day
        return (0, date_fns_1.format)(date1, 'EEEE, MMM d');
    }
    if ((0, date_fns_1.isSameDay)(date1, date2)) {
        // Dates are from the same day but not this year
        return (0, date_fns_1.format)(date1, 'EEEE, MMM d, yyyy');
    }
    if ((0, date_fns_1.isSameYear)(date1, date2) && (0, date_fns_1.isThisYear)(date1)) {
        // Dates are in the current year, differ by months
        return "".concat((0, date_fns_1.format)(date1, 'EEEE, MMM d'), " ").concat((0, Localize_1.translateLocal)('common.conjunctionTo'), " ").concat((0, date_fns_1.format)(date2, 'EEEE, MMM d'));
    }
    // Dates differ by years, months, days or only by months but the year is not current
    return "".concat((0, date_fns_1.format)(date1, 'EEEE, MMM d, yyyy'), " ").concat((0, Localize_1.translateLocal)('common.conjunctionTo'), " ").concat((0, date_fns_1.format)(date2, 'EEEE, MMM d, yyyy'));
}
/**
 * Returns a formatted date of departure.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Departs on Sunday, Mar 17 at 8:00.
 * 2. When the date refers not to the current year: Departs on Wednesday, Mar 17, 2023 at 8:00.
 */
function getFormattedTransportDate(date) {
    if ((0, date_fns_1.isThisYear)(date)) {
        return "".concat((0, Localize_1.translateLocal)('travel.departs'), " ").concat((0, date_fns_1.format)(date, 'EEEE, MMM d'), " ").concat((0, Localize_1.translateLocal)('common.conjunctionAt'), " ").concat((0, date_fns_1.format)(date, 'hh:mm a'));
    }
    return "".concat((0, Localize_1.translateLocal)('travel.departs'), " ").concat((0, date_fns_1.format)(date, 'EEEE, MMM d, yyyy'), " ").concat((0, Localize_1.translateLocal)('common.conjunctionAt'), " ").concat((0, date_fns_1.format)(date, 'hh:mm a'));
}
/**
 * Returns a formatted flight date and hour.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function getFormattedTransportDateAndHour(date) {
    if ((0, date_fns_1.isThisYear)(date)) {
        return {
            date: (0, date_fns_1.format)(date, 'EEEE, MMM d'),
            hour: (0, date_fns_1.format)(date, 'h:mm a'),
        };
    }
    return {
        date: (0, date_fns_1.format)(date, 'EEEE, MMM d, yyyy'),
        hour: (0, date_fns_1.format)(date, 'h:mm a'),
    };
}
/**
 * Returns a formatted cancellation date.
 * Dates are formatted as follows:
 * 1. When the date refers to the current year: Wednesday, Mar 17 8:00 AM
 * 2. When the date refers not to the current year: Wednesday, Mar 17, 2023 8:00 AM
 */
function getFormattedCancellationDate(date) {
    if ((0, date_fns_1.isThisYear)(date)) {
        return (0, date_fns_1.format)(date, 'EEEE, MMM d h:mm a');
    }
    return (0, date_fns_1.format)(date, 'EEEE, MMM d, yyyy h:mm a');
}
/**
 * Returns a formatted layover duration in format "2h 30m".
 */
function getFormattedDurationBetweenDates(translateParam, start, end) {
    var _a = (0, date_fns_1.intervalToDuration)({ start: start, end: end }), days = _a.days, hours = _a.hours, minutes = _a.minutes;
    if (days && days > 0) {
        return;
    }
    return "".concat(hours ? "".concat(hours).concat(translateParam('common.hourAbbreviation'), " ") : '').concat(minutes).concat(translateParam('common.minuteAbbreviation'));
}
function getFormattedDuration(translateParam, durationInSeconds) {
    var hours = Math.floor(durationInSeconds / 3600);
    var minutes = Math.floor((durationInSeconds % 3600) / 60);
    return "".concat(hours ? "".concat(hours).concat(translateParam('common.hourAbbreviation'), " ") : '').concat(minutes).concat(translateParam('common.minuteAbbreviation'));
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
    return (0, date_fns_1.differenceInDays)(new Date(), date);
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
    return "".concat((0, date_fns_1.format)(date1, 'MMM d, yyyy'), " - ").concat((0, date_fns_1.format)(date2, 'MMM d, yyyy'));
}
/**
 * Checks if the current time falls within the specified time range.
 */
var isCurrentTimeWithinRange = function (startTime, endTime) {
    var now = Date.now();
    return (0, date_fns_1.isAfter)(now, new Date(startTime)) && (0, date_fns_1.isBefore)(now, new Date(endTime));
};
/**
 * Converts a date to a string in the format MMMM d, yyyy
 */
var formatToReadableString = function (date) {
    var parsedDate = (0, date_fns_1.parse)(date, 'yyyy-MM-dd', new Date());
    return (0, date_fns_1.format)(parsedDate, 'MMMM d, yyyy');
};
var formatInTimeZoneWithFallback = function (date, timeZone, formatStr, options) {
    try {
        return (0, date_fns_tz_1.formatInTimeZone)(date, timeZone, formatStr, options);
        // On macOs and iOS devices some platform use deprecated old timezone values which results in invalid time string error.
        // Try with backward timezone values on error.
    }
    catch (_a) {
        return (0, date_fns_tz_1.formatInTimeZone)(date, TIMEZONES_1.timezoneNewToBackwardMap[timeZone], formatStr, options);
    }
};
var DateUtils = {
    isDate: isDate,
    formatToDayOfWeek: formatToDayOfWeek,
    formatToLongDateWithWeekday: formatToLongDateWithWeekday,
    formatToLocalTime: formatToLocalTime,
    formatToReadableString: formatToReadableString,
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
    getFormattedCancellationDate: getFormattedCancellationDate,
    doesDateBelongToAPastYear: doesDateBelongToAPastYear,
    isCardExpired: isCardExpired,
    getDifferenceInDaysFromNow: getDifferenceInDaysFromNow,
    isValidDateString: isValidDateString,
    getFormattedDurationBetweenDates: getFormattedDurationBetweenDates,
    getFormattedDuration: getFormattedDuration,
    isFutureDay: isFutureDay,
    getFormattedDateRangeForPerDiem: getFormattedDateRangeForPerDiem,
    isCurrentTimeWithinRange: isCurrentTimeWithinRange,
    formatInTimeZoneWithFallback: formatInTimeZoneWithFallback,
};
exports.default = DateUtils;
