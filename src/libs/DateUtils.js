import lodashGet from 'lodash/get';
import {zonedTimeToUtc, utcToZonedTime, formatInTimeZone} from 'date-fns-tz';
import {es, enGB} from 'date-fns/locale';
import {
    formatDistanceToNow,
    subMinutes,
    isBefore,
    subMilliseconds,
    isToday,
    isTomorrow,
    isYesterday,
    startOfWeek,
    endOfWeek,
    format,
    setDefaultOptions,
    endOfDay,
    isSameDay,
    isAfter,
    isSameYear,
} from 'date-fns';

import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as Localize from './Localize';
import * as CurrentDate from './actions/CurrentDate';

let currentUserAccountID;
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

let timezone = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        timezone = lodashGet(val, [currentUserAccountID, 'timezone'], CONST.DEFAULT_TIME_ZONE);
    },
});

/**
 * Gets the locale string and setting default locale for date-fns
 *
 * @param {String} localeString
 */
function setLocale(localeString) {
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
 * Moment object for the given ISO-formatted datetime string
 *
 * @private
 * @param {String} locale
 * @param {String} datetime
 * @param {String} [currentSelectedTimezone]
 * @returns  {Moment}
 *
 */
function getLocalDateFromDatetime(locale, datetime, currentSelectedTimezone = timezone.selected) {
    setLocale(locale);
    if (!datetime) {
        return utcToZonedTime(new Date(), currentSelectedTimezone);
    }
    const parsedDatetime = new Date(`${datetime}Z`);
    return utcToZonedTime(parsedDatetime, currentSelectedTimezone);
}

/**
 * Formats an ISO-formatted datetime string to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 *
 * @param {String} locale
 * @param {String} datetime
 * @param {Boolean} includeTimeZone
 * @param {String} [currentSelectedTimezone]
 * @param {Boolean} isLowercase
 * @returns {String}
 */
function datetimeToCalendarTime(locale, datetime, includeTimeZone = false, currentSelectedTimezone, isLowercase = false) {
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

    if (isToday(date)) {
        return `${todayAt} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
    }
    if (isTomorrow(date)) {
        return `${tomorrowAt} ${format(date, CONST.DATE.LOCAL_TIME_FORMAT)}${tz}`;
    }
    if (isYesterday(date)) {
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
 *
 * @param {String} locale
 * @param {String} datetime
 * @returns {String}
 */
function datetimeToRelative(locale, datetime) {
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
 * @param {String} datetime
 * @param {String} selectedTimezone
 * @returns {String}
 */
function getZoneAbbreviation(datetime, selectedTimezone) {
    return formatInTimeZone(datetime, selectedTimezone, 'zzz');
}

/**
 * Format date to a long date format with weekday
 *
 * @param {String} datetime
 * @returns {String} Sunday, July 9, 2023
 */
function formatToLongDateWithWeekday(datetime) {
    return format(new Date(datetime), CONST.DATE.LONG_DATE_FORMAT_WITH_WEEKDAY);
}

/**
 * Format date to a weekday format
 *
 * @param {String} datetime
 * @returns {String} Sunday
 */
function formatToDayOfWeek(datetime) {
    return format(new Date(datetime), CONST.DATE.WEEKDAY_TIME_FORMAT);
}

/**
 * Format date to a local time
 *
 * @param {String} datetime
 * @returns {String} 2:30 PM
 */
function formatToLocalTime(datetime) {
    return format(new Date(datetime), CONST.DATE.LOCAL_TIME_FORMAT);
}

/**
 * A throttled version of a function that updates the current date in Onyx store
 */
const updateCurrentDate = _.throttle(() => {
    const currentDate = format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    CurrentDate.setCurrentDate(currentDate);
}, 1000 * 60 * 60 * 3); // 3 hours

/**
 * Initialises the event listeners that trigger the current date update
 */
function startCurrentDateUpdater() {
    const trackedEvents = ['mousemove', 'touchstart', 'keydown', 'scroll'];
    trackedEvents.forEach((eventName) => {
        document.addEventListener(eventName, updateCurrentDate);
    });
}

/**
 * @returns {Object}
 */
function getCurrentTimezone() {
    const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        return {...timezone, selected: currentTimezone};
    }
    return timezone;
}

// Used to throttle updates to the timezone when necessary
let lastUpdatedTimezoneTime = new Date();

/**
 * @returns {Boolean}
 */
function canUpdateTimezone() {
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
 *
 * @returns {Number}
 */
function getMicroseconds() {
    return Date.now() * CONST.MICROSECONDS_PER_MS;
}

/**
 * Returns the current time in milliseconds in the format expected by the database
 *
 * @param {String|Number} [timestamp]
 * @returns {String}
 */
function getDBTime(timestamp = '') {
    const datetime = timestamp ? new Date(timestamp) : new Date();
    return datetime.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * @param {String} dateTime
 * @param {Number} milliseconds
 * @returns {String}
 */
function subtractMillisecondsFromDateTime(dateTime, milliseconds) {
    const date = zonedTimeToUtc(dateTime, 'UTC');
    const newTimestamp = subMilliseconds(date, milliseconds).valueOf();
    return getDBTime(newTimestamp);
}

/**
 * @param {string} isoTimestamp example: 2023-05-16 05:34:14.388
 * @returns {string} example: 2023-05-16
 */
function getDateStringFromISOTimestamp(isoTimestamp) {
    if (!isoTimestamp) {
        return '';
    }

    const [dateString] = isoTimestamp.split(' ');
    return dateString;
}

/**
 * receive date like 2020-05-16 05:34:14 and format it to show in string like "Until 05:34 PM"
 *
 * @param {String} inputDate
 * @returns {String}
 */
function getStatusUntilDate(inputDate) {
    if (!inputDate) return '';
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
 * @namespace DateUtils
 */
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
    subtractMillisecondsFromDateTime,
    getDateStringFromISOTimestamp,
    getStatusUntilDate,
};

export default DateUtils;
