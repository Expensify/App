import type {DateTimeFormatConstructor} from '@formatjs/intl-datetimeformat';
import DateUtils from '@libs/DateUtils';

/* eslint-disable @typescript-eslint/naming-convention */
const tzLinks: Record<string, string> = {
    'Africa/Abidjan': 'Africa/Accra',
    CET: 'Europe/Paris',
    CST6CDT: 'America/Chicago',
    EET: 'Europe/Sofia',
    EST: 'America/Cancun',
    EST5EDT: 'America/New_York',
    'Etc/GMT': 'UTC',
    'Etc/UTC': 'UTC',
    Factory: 'UTC',
    GMT: 'UTC',
    HST: 'Pacific/Honolulu',
    MET: 'Europe/Paris',
    MST: 'America/Phoenix',
    MST7MDT: 'America/Denver',
    PST8PDT: 'America/Los_Angeles',
    WET: 'Europe/Lisbon',
};
/* eslint-enable @typescript-eslint/naming-convention */

export default function () {
    // Because JS Engines do not expose default timezone, the polyfill cannot detect local timezone that a browser is in.
    // We must manually do this by getting the local timezone before adding polyfill.
    let currentTimezone = DateUtils.getCurrentTimezone().selected as string;
    if (currentTimezone in tzLinks) {
        currentTimezone = tzLinks[currentTimezone];
    }

    require('@formatjs/intl-datetimeformat/polyfill');
    require('@formatjs/intl-datetimeformat/locale-data/en');
    require('@formatjs/intl-datetimeformat/locale-data/es');
    require('@formatjs/intl-datetimeformat/add-all-tz');

    if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
        // eslint-disable-next-line no-underscore-dangle
        (Intl.DateTimeFormat as DateTimeFormatConstructor).__setDefaultTimeZone(currentTimezone);
    }
}
