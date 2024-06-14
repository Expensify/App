import {differenceInCalendarDays, fromUnixTime, isAfter, isBefore, parse as parseDate} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, Policy} from '@src/types/onyx';

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

let userBillingGraceEndPeriodCollection: OnyxCollection<BillingGraceEndPeriod>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    callback: (value) => (userBillingGraceEndPeriodCollection = value),
    waitForCollectionCallback: true,
});

let ownerBillingGraceEndPeriod: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => (ownerBillingGraceEndPeriod = value),
});

let amountOwed: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_AMOUNT_OWNED,
    callback: (value) => (amountOwed = value),
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value) => (allPolicies = value),
    waitForCollectionCallback: true,
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

/**
 * Whether the user's billable actions should be restricted.
 */
function shouldRestrictUserBillableActions(policyID: string): boolean {
    // This logic will be executed if the user is a workspace's non-owner (normal user or admin).
    // We should restrict the workspace's non-owner actions if it's member of a workspace where the owner is
    // past due and is past its grace period end.
    for (const userBillingGraceEndPeriodEntry of Object.entries(userBillingGraceEndPeriodCollection ?? {})) {
        const [entryKey, userBillingGracePeriodEnd] = userBillingGraceEndPeriodEntry;

        if (userBillingGracePeriodEnd && isAfter(new Date(), fromUnixTime(userBillingGracePeriodEnd.value))) {
            // Extracts the owner account ID from the collection member key.
            const ownerAccountID = entryKey.slice(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END.length);

            const ownerPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
            if (String(ownerPolicy?.ownerAccountID ?? -1) === ownerAccountID) {
                return true;
            }
        }
    }

    // If it reached here it means that the user is actually the workspace's owner.
    // We should restrict the workspace's owner actions if it's past its grace period end date and it's owing some amount.
    if (ownerBillingGraceEndPeriod && amountOwed !== undefined && isAfter(new Date(), fromUnixTime(ownerBillingGraceEndPeriod))) {
        return true;
    }

    return false;
}

export {calculateRemainingFreeTrialDays, doesUserHavePaymentCardAdded, hasUserFreeTrialEnded, isUserOnFreeTrial, shouldRestrictUserBillableActions};
