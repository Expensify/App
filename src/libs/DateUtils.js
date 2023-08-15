import moment from 'moment-timezone';
import lodashGet from 'lodash/get';

// IMPORTANT: load any locales (other than english) that might be passed to moment.locale()
import 'moment/locale/es';

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
 * Gets the user's stored time zone NVP and returns a localized
 * Moment object for the given ISO-formatted datetime string
 *
 * @param {String} locale
 * @param {String} datetime
 * @param {String} [currentSelectedTimezone]
 *
 * @returns  {Moment}
 *
 * @private
 */
function getLocalMomentFromDatetime(locale, datetime, currentSelectedTimezone = timezone.selected) {
    moment.locale(locale);
    if (!datetime) {
        return moment.tz(currentSelectedTimezone);
    }

    return moment.utc(datetime).tz(currentSelectedTimezone);
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
 *
 * @returns {String}
 */
function datetimeToCalendarTime(locale, datetime, includeTimeZone = false, currentSelectedTimezone, isLowercase = false) {
    const date = getLocalMomentFromDatetime(locale, datetime, currentSelectedTimezone);
    const tz = includeTimeZone ? ' [UTC]Z' : '';

    let todayAt = Localize.translate(locale, 'common.todayAt');
    let tomorrowAt = Localize.translate(locale, 'common.tomorrowAt');
    let yesterdayAt = Localize.translate(locale, 'common.yesterdayAt');
    const at = Localize.translate(locale, 'common.conjunctionAt');

    if (isLowercase) {
        todayAt = todayAt.toLowerCase();
        tomorrowAt = tomorrowAt.toLowerCase();
        yesterdayAt = yesterdayAt.toLowerCase();
    }

    return moment(date).calendar({
        sameDay: `[${todayAt}] LT${tz}`,
        nextDay: `[${tomorrowAt}] LT${tz}`,
        lastDay: `[${yesterdayAt}] LT${tz}`,
        nextWeek: `MMM D [${at}] LT${tz}`,
        lastWeek: `MMM D [${at}] LT${tz}`,
        sameElse: `MMM D, YYYY [${at}] LT${tz}`,
    });
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
 *
 * @returns {String}
 */
function datetimeToRelative(locale, datetime) {
    const date = getLocalMomentFromDatetime(locale, datetime);

    return moment(date).fromNow();
}

/**
 * A throttled version of a function that updates the current date in Onyx store
 */
const updateCurrentDate = _.throttle(() => {
    const currentDate = moment().format('YYYY-MM-DD');
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
    const currentTimezone = moment.tz.guess(true);
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        return {...timezone, selected: currentTimezone};
    }
    return timezone;
}

// Used to throttle updates to the timezone when necessary
let lastUpdatedTimezoneTime = moment();

/**
 * @returns {Boolean}
 */
function canUpdateTimezone() {
    return lastUpdatedTimezoneTime.isBefore(moment().subtract(5, 'minutes'));
}

function setTimezoneUpdated() {
    lastUpdatedTimezoneTime = moment();
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
 *
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
    const newTimestamp = moment.utc(dateTime).subtract(milliseconds, 'milliseconds').valueOf();
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

    const input = moment(inputDate, 'YYYY-MM-DD HH:mm:ss');
    const now = moment();
    const endOfToday = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');

    // If the date is equal to the end of today
    if (input.isSame(endOfToday)) {
        return translateLocal('statusPage.untilTomorrow');
    }

    // If it's a time on the same date
    if (input.isSame(now, 'day')) {
        return translateLocal('statusPage.untilTime', {time: input.format('hh:mm A')});
    }

    // If it's further in the future than tomorrow but within the same year
    if (input.isAfter(now) && input.isSame(now, 'year')) {
        return translateLocal('statusPage.untilTime', {time: input.format('MM-DD hh:mm A')});
    }

    // If it's in another year
    return translateLocal('statusPage.untilTime', {time: input.format('YYYY-MM-DD hh:mm A')});
}

/**
 * @namespace DateUtils
 */
const DateUtils = {
    datetimeToRelative,
    datetimeToCalendarTime,
    startCurrentDateUpdater,
    getLocalMomentFromDatetime,
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
