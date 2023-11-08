import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {Timezone} from '@src/types/onyx/PersonalDetails';

/* eslint-disable @typescript-eslint/naming-convention */
const tzLinks: Record<string, string> = {
    "Africa/Abidjan": "Africa/Accra",
    "CET": "Europe/Paris",
    "CST6CDT": "America/Chicago",
    "EET": "Europe/Sofia",
    "EST": "America/Cancun",
    "EST5EDT": "America/New_York",
    "Etc/GMT": "UTC",
    "Etc/UTC": "UTC",
    "Factory": "UTC",
    "GMT": "UTC",
    "HST": "Pacific/Honolulu",
    "MET": "Europe/Paris",
    "MST": "America/Phoenix",
    "MST7MDT": "America/Denver",
    "PST8PDT": "America/Los_Angeles",
    "WET": "Europe/Lisbon"
}
/* eslint-enable @typescript-eslint/naming-convention */

let currentUserAccountID: number | undefined;
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

let timezone: Required<Timezone> = CONST.DEFAULT_TIME_ZONE;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!currentUserAccountID) {
            return;
        }

        const personalDetailsTimezone = value?.[currentUserAccountID]?.timezone;

        timezone = {
            selected: personalDetailsTimezone?.selected ?? CONST.DEFAULT_TIME_ZONE.selected,
            automatic: personalDetailsTimezone?.automatic ?? CONST.DEFAULT_TIME_ZONE.automatic,
        };
    },
});

export default function () {
    // Because JS Engines do not expose default timezone, the polyfill cannot detect local timezone that a browser is in.
    // We must manually do this by getting the local timezone before adding polyfill.
    let currentTimezone = timezone.automatic ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone.selected;
    if (currentTimezone in tzLinks) {
        currentTimezone = tzLinks[currentTimezone];
    }

    require('@formatjs/intl-datetimeformat/polyfill-force');
    require('@formatjs/intl-datetimeformat/locale-data/en');
    require('@formatjs/intl-datetimeformat/locale-data/es');
    require('@formatjs/intl-datetimeformat/add-all-tz');

    if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-underscore-dangle
        Intl.DateTimeFormat.__setDefaultTimeZone(currentTimezone);
    }
}
