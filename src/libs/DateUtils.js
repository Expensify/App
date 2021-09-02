import moment from 'moment-timezone';

// IMPORTANT: load any locales (other than english) that might be passed to moment.locale()
import 'moment/locale/es';

import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import {translate} from './translate';
import * as PersonalDetails from './actions/PersonalDetails';

let timezone;
Onyx.connect({
    key: ONYXKEYS.MY_PERSONAL_DETAILS,
    callback: (val) => {
        timezone = val ? val.timezone : CONST.DEFAULT_TIME_ZONE;
    },
});

/**
 * Gets the user's stored time-zone NVP and returns a localized
 * Moment object for the given timestamp
 *
 * @param {String} locale
 * @param {Number} timestamp
 *
 * @returns  {Moment}
 *
 * @private
 */
function getLocalMomentFromTimestamp(locale, timestamp) {
    moment.locale(locale);
    return moment.unix(timestamp).tz(timezone.selected);
}

/**
 * Formats a timestamp to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 *
 * @param {String} locale
 * @param {Number} timestamp
 * @param {Boolean} includeTimeZone
 *
 * @returns {String}
 */
function timestampToDateTime(locale, timestamp, includeTimeZone = false) {
    const date = getLocalMomentFromTimestamp(locale, timestamp);
    const tz = includeTimeZone ? ' [UTC]Z' : '';

    const todayAt = translate(locale, 'common.todayAt');
    const tomorrowAt = translate(locale, 'common.tomorrowAt');
    const yesterdayAt = translate(locale, 'common.yesterdayAt');
    const at = translate(locale, 'common.conjunctionAt');

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
 * Converts a timestamp into a localized string representation
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
 * @param {Number} timestamp
 *
 * @returns {String}
 */
function timestampToRelative(locale, timestamp) {
    const date = getLocalMomentFromTimestamp(locale, timestamp);

    return moment(date).fromNow();
}

/**
 * A throttled version of a function that updates the current date in Onyx store
 */
const updateCurrentDate = _.throttle(() => {
    const currentDate = moment().format('YYYY-MM-DD');
    Onyx.set(ONYXKEYS.CURRENT_DATE, currentDate);
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

/*
 * Updates user's timezone, if their timezone is set to automatic and
 * is different from current timezone
 */
function updateTimezone() {
    const currentTimezone = moment.tz.guess(true);
    if (timezone.automatic && timezone.selected !== currentTimezone) {
        PersonalDetails.setPersonalDetails({timezone: {...timezone, selected: currentTimezone}});
    }
}

/*
 * Returns a version of updateTimezone function throttled by 5 minutes
 */
const throttledUpdateTimezone = _.throttle(() => updateTimezone(), 1000 * 60 * 5);

/**
 * @namespace DateUtils
 */
const DateUtils = {
    timestampToRelative,
    timestampToDateTime,
    startCurrentDateUpdater,
    updateTimezone,
    throttledUpdateTimezone,
};

export default DateUtils;
