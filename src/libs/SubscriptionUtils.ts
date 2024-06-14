import {differenceInCalendarDays, parse as parseDate} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let lastDayFreeTrial: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL,
    callback: (value) => (lastDayFreeTrial = value),
});

function calculateRemainingFreeTrialDays(): number {
    if (!lastDayFreeTrial) {
        return 0;
    }

    const difference = differenceInCalendarDays(parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, new Date()), new Date());
    return difference < 0 ? 0 : difference;
}

export {calculateRemainingFreeTrialDays};
