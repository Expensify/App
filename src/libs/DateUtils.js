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

let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserEmail = val.email;
    },
});

let timezone = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => {
        timezone = lodashGet(val, [currentUserEmail, 'timezone'], CONST.DEFAULT_TIME_ZONE);
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
 *
 * @returns {String}
 */
function datetimeToCalendarTime(locale, datetime, includeTimeZone = false) {
    const date = getLocalMomentFromDatetime(locale, datetime);
    const tz = includeTimeZone ? ' [UTC]Z' : '';

    const todayAt = Localize.translate(locale, 'common.todayAt');
    const tomorrowAt = Localize.translate(locale, 'common.tomorrowAt');
    const yesterdayAt = Localize.translate(locale, 'common.yesterdayAt');
    const at = Localize.translate(locale, 'common.conjunctionAt');

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
    return datetime.toISOString()
        .replace('T', ' ')
        .replace('Z', '');
}

/**
 * Returns the datetime string one millisecond before a given datetime string
 *
 * @param {String} dateTimeString in the format expected by the database
 * @returns {String} in the format expected by the database
 */
function oneMillisecondBefore(dateTimeString) {
    const oneMillisecondBeforeTimestamp = moment.utc(dateTimeString).subtract(1, 'millisecond').valueOf();
    return getDBTime(oneMillisecondBeforeTimestamp);
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
    oneMillisecondBefore,
};

export default DateUtils;
