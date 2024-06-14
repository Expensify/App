import {differenceInCalendarDays, isAfter, isBefore, parse as parseDate} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let firstDayFreeTrial: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_FIRST_DAY_FREE_TRIAL,
    callback: (value) => (firstDayFreeTrial = value),
});

let lastDayFreeTrial: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL,
    callback: (value) => (lastDayFreeTrial = value),
});

let userBillingFundID: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_BILLING_FUND_ID,
    callback: (value) => (userBillingFundID = value),
});

/**
 * Calculates the remaining number of days of the workspace owner's free trial before it ends.
 */
function calculateRemainingFreeTrialDays(): number {
    if (!lastDayFreeTrial) {
        return 0;
    }

    const difference = differenceInCalendarDays(parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, new Date()), new Date());
    return difference < 0 ? 0 : difference;
}

/**
 * Whether the workspace's owner is on its free trial period.
 */
function isUserOnFreeTrial(): boolean {
    if (!firstDayFreeTrial || !lastDayFreeTrial) {
        return true;
    }

    const currentDate = new Date();
    const firstDayFreeTrialDate = parseDate(firstDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, new Date());
    const lastDayFreeTrialDate = parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, new Date());

    return isAfter(currentDate, firstDayFreeTrialDate) && isBefore(currentDate, lastDayFreeTrialDate);
}

/**
 * Whether the workspace owner's free trial period has ended.
 */
function hasUserFreeTrialEnded(): boolean {
    if (!lastDayFreeTrial) {
        return false;
    }

    const currentDate = new Date();
    const lastDayFreeTrialDate = parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, new Date());

    return isAfter(currentDate, lastDayFreeTrialDate);
}

/**
 * Whether the user has a payment card added to its account.
 */
function doesUserHavePaymentCardAdded(): boolean {
    return userBillingFundID !== undefined;
}

export {calculateRemainingFreeTrialDays, isUserOnFreeTrial, hasUserFreeTrialEnded, doesUserHavePaymentCardAdded};
