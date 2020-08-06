/* globals moment */
import Str from './Str.js';

// Non-Deprecated Methods

/**
 * Gets the user's stored time-zone NVP
 *
 * @returns {string}
 *
 * @private
 */
function getTimezone() {
  return 'America/Los_Angeles';
}

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
  // We need a default here for flows where we may not have initialized the TIME_ZONE NVP like generatng PDFs in printablereport.php
  const timezone = getTimezone();
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
  let format =
    moment().year() !== date.get('year')
      ? 'MMM D, YYYY [at] LT'
      : 'MMM D [at] LT';
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
  const round = (num) => Math.floor(Math.abs(num));

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
