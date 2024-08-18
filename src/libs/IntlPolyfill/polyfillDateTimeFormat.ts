import type {DateTimeFormatConstructor} from '@formatjs/intl-datetimeformat';
import DateUtils from '@libs/DateUtils';
import {timezoneBackwardMap} from '@src/TIMEZONES';

/* eslint-enable @typescript-eslint/naming-convention */

export default function () {
    // Because JS Engines do not expose default timezone, the polyfill cannot detect local timezone that a browser is in.
    // We must manually do this by getting the local timezone before adding polyfill.
    let currentTimezone = DateUtils.getCurrentTimezone().selected as string;

    if (currentTimezone in timezoneBackwardMap) {
        currentTimezone = timezoneBackwardMap[currentTimezone];
    }

    require('@formatjs/intl-datetimeformat/polyfill-force');
    require('@formatjs/intl-datetimeformat/locale-data/en');
    require('@formatjs/intl-datetimeformat/locale-data/es');
    require('@formatjs/intl-datetimeformat/add-all-tz');

    if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
        // eslint-disable-next-line no-underscore-dangle
        (Intl.DateTimeFormat as DateTimeFormatConstructor).__setDefaultTimeZone(currentTimezone);
    }
}
