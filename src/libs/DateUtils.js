import moment from 'moment';
import 'moment-timezone';
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';

let timezone;
Onyx.connect({
    key: ONYXKEYS.MY_PERSONAL_DETAILS,
    callback: (val) => {
        timezone = val ? val.timezone : CONST.DEFAULT_TIME_ZONE.selected;

        // Make sure that if we have a timezone in object format that we're getting the selected timezone name
        // Older timezone formats only include the timezone name, but the newer format also included whether or
        // not the timezone was selected automatically
        if (_.isObject(timezone)) {
            timezone = val.timezone.selected;
        }
    },
});

/**
 * Gets the user's stored time-zone NVP and returns a localized
 * Moment object for the given timestamp
 *
 * @param {Number} timestamp
 *
 * @returns  {Moment}
 *
 * @private
 */
function getLocalMomentFromTimestamp(timestamp) {
    return moment.unix(timestamp).tz(timezone);
}

/**
 * Formats a timestamp to local date and time string
 *
 * e.g.
 *
 * Jan 20 at 5:30 PM          within the past year
 * Jan 20, 2019 at 5:30 PM    anything over 1 year ago
 *
 * @param {Number} timestamp
 * @param {Boolean} includeTimeZone
 *
 * @returns {String}
 */
function timestampToDateTime(timestamp, includeTimeZone = false) {
    const date = getLocalMomentFromTimestamp(timestamp);
    const isThisYear = moment().format('YYYY') === date.format('YYYY');
    const isToday = moment().format('D MMM YYYY') === date.format('D MMM YYYY');
    const yesterday = moment().add(-1, 'day').format('D MMM YYYY');
    const isYesterday = yesterday === date.format('D MMM YYYY');

    let format = 'LT';
    if (isYesterday) {
        format = `[Yesterday at] ${format}`;
    } else if (!isToday) {
        format = `MMM D [at] ${format}`;
    } else if (!isThisYear) {
        format = `MMM D, YYYY [at] ${format}`;
    }

    if (includeTimeZone) {
        format = `${format} [UTC]Z`;
    }

    return date.format(format);
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
 * @param {Number} timestamp
 *
 * @returns {String}
 */
function timestampToRelative(timestamp) {
    const date = getLocalMomentFromTimestamp(timestamp);
    const durationFromLocalNow = moment.duration(
        date.diff(getLocalMomentFromTimestamp(moment().unix())),
    );
    const round = num => Math.floor(Math.abs(num));

    if (date.isAfter(moment().subtract(60, 'seconds'))) {
        return '< 1 minute ago';
    }

    if (date.isAfter(moment().subtract(60, 'minutes'))) {
        const minutes = round(durationFromLocalNow.asMinutes());
        return `${minutes} ${Str.pluralize('minute', 'minutes', minutes)} ago`;
    }

    if (date.isAfter(moment().subtract(24, 'hours'))) {
        const hours = round(durationFromLocalNow.asHours());
        return `${hours} ${Str.pluralize('hour', 'hours', hours)} ago`;
    }

    if (date.isAfter(moment().subtract(30, 'days'))) {
        const days = round(durationFromLocalNow.asDays());
        return `${days} ${Str.pluralize('day', 'days', days)} ago`;
    }

    if (date.isAfter(moment().subtract(1, 'year'))) {
        return date.format('MMM D');
    }

    return date.format('MMM D, YYYY');
}

/**
 * @namespace DateUtils
 */
const DateUtils = {
    timestampToRelative,
    timestampToDateTime,
};

export default DateUtils;
