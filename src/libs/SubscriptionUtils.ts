import {differenceInSeconds, fromUnixTime, isAfter, isBefore, parse as parseDate} from 'date-fns';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, Fund, Policy} from '@src/types/onyx';

const PAYMENT_STATUSES = {
    POLICY_OWNER_WITH_AMOUNT_OWED: 'policy_owner_with_amount_owed',
    POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE: 'policy_owner_with_amount_owed_overdue',
    OWNER_OF_POLICY_UNDER_INVOICING: 'owner_of_policy_under_invoicing',
    OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE: 'owner_of_policy_under_invoicing_overdue',
    BILLING_DISPUTE_PENDING: 'billing_dispute_pending',
    CARD_AUTHENTICATION_REQUIRED: 'authentication_required',
    INSUFFICIENT_FUNDS: 'insufficient_funds',
    CARD_EXPIRED: 'expired_card',
    CARD_EXPIRE_SOON: 'card_expire_soon',
    RETRY_BILLING_SUCCESS: 'retry_billing_success',
    RETRY_BILLING_ERROR: 'retry_billing_error',
    GENERIC_API_ERROR: 'generic_api_error',
};

let amountOwed: OnyxValues[typeof ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED];
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    callback: (value) => {
        if (!value) {
            return;
        }

        amountOwed = value;
    },
});

let stripeCustomerId: OnyxValues[typeof ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID];
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
    callback: (value) => {
        if (!value) {
            return;
        }

        stripeCustomerId = value;
    },
});

let billingDisputePending: OnyxValues[typeof ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING];
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    callback: (value) => {
        if (!value) {
            return;
        }

        billingDisputePending = value;
    },
});

let billingStatus: OnyxValues[typeof ONYXKEYS.NVP_PRIVATE_BILLING_STATUS];
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_STATUS,
    callback: (value) => {
        if (!value) {
            return;
        }

        billingStatus = value;
    },
});

let billingGracePeriod: OnyxValues[typeof ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END];
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        billingGracePeriod = value;
    },
});

let fundList: OnyxValues[typeof ONYXKEYS.FUND_LIST];
Onyx.connect({
    key: ONYXKEYS.FUND_LIST,
    callback: (value) => {
        if (!value) {
            return;
        }

        fundList = value;
    },
});

let billingStatusFailed: OnyxValues[typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED];
Onyx.connect({
    key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        billingStatusFailed = value;
    },
});

let billingStatusSuccessful: OnyxValues[typeof ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL];
Onyx.connect({
    key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        billingStatusSuccessful = value;
    },
});

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

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value) => (allPolicies = value),
    waitForCollectionCallback: true,
});

function getOverdueGracePeriodDate(): number {
    return billingGracePeriod;
}

function hasOverdueGracePeriod(): boolean {
    return !!billingGracePeriod ?? false;
}

function hasGracePeriodOverdue(): boolean {
    return !!billingGracePeriod && Date.now() < new Date(billingGracePeriod).getTime();
}

/// getGracePeriodEndDate - return formatted date

function getAmountOwed(): number {
    return amountOwed ?? 0;
}

function hasCardAuthenticatedError() {
    return stripeCustomerId?.status === 'authentication_required' && amountOwed === 0;
}

function hasBillingDisputePending() {
    return !!billingDisputePending ?? false;
}

function hasCardExpiredError() {
    return billingStatus?.declineReason === 'expired_card' && amountOwed !== 0;
}

function hasInsufficientFundsError() {
    return billingStatus?.declineReason === 'insufficient_funds' && amountOwed !== 0;
}

function getCardForSubscriptionBilling(): Fund | undefined {
    return Object.values(fundList ?? {}).find((card) => card?.isDefault);
}

function hasCardExpiringSoon(): boolean {
    const card = getCardForSubscriptionBilling();

    if (!card) {
        return false;
    }

    return !billingStatus && card?.accountData?.cardMonth === new Date().getMonth() + 1;
}

// hasRetryBillingError - based on request response
function hasRetryBillingError(): boolean {
    return !!billingStatusFailed;
}

function isRetryBillingSuccessful(): boolean {
    return !!billingStatusSuccessful;
}

// hasCardExpiredSoon - based on card

type SubscriptionStatus = {
    status?: string;
    isError?: boolean;
    shouldShowRedDotIndicator?: boolean;
    shouldShowGreenDotIndicator?: boolean;
};

function getSubscriptionStatus(): SubscriptionStatus {
    if (hasOverdueGracePeriod()) {
        if (amountOwed) {
            // 1. Policy owner with amount owed, within grace period
            if (hasGracePeriodOverdue() === false) {
                return {
                    status: PAYMENT_STATUSES.POLICY_OWNER_WITH_AMOUNT_OWED,
                    isError: true,
                    shouldShowRedDotIndicator: true,
                };
            }

            // 2. Policy owner with amount owed, overdue (past grace period)
            if (hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUSES.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
                    shouldShowRedDotIndicator: true,
                };
            }
        } else {
            // 3. Owner of policy under invoicing, within grace period
            if (hasGracePeriodOverdue() && !amountOwed) {
                return {
                    status: PAYMENT_STATUSES.OWNER_OF_POLICY_UNDER_INVOICING,

                    shouldShowRedDotIndicator: true,
                };
            }

            // 4. Owner of policy under invoicing, overdue (past grace period)
            if (hasGracePeriodOverdue() === false && amountOwed) {
                return {
                    status: PAYMENT_STATUSES.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
                    shouldShowRedDotIndicator: true,
                };
            }
        }
    }

    // 5. Billing disputed by cardholder
    if (hasBillingDisputePending()) {
        return {
            status: PAYMENT_STATUSES.BILLING_DISPUTE_PENDING,
            shouldShowRedDotIndicator: true,
        };
    }

    // 6. Card not authenticated
    if (hasCardAuthenticatedError()) {
        return {
            status: PAYMENT_STATUSES.CARD_AUTHENTICATION_REQUIRED,
            shouldShowRedDotIndicator: true,
        };
    }

    // 7. Insufficient funds
    if (hasInsufficientFundsError()) {
        return {
            status: PAYMENT_STATUSES.INSUFFICIENT_FUNDS,
            shouldShowRedDotIndicator: true,
        };
    }

    // 8. Card expired
    if (hasCardExpiredError()) {
        return {
            status: PAYMENT_STATUSES.CARD_EXPIRED,
            shouldShowRedDotIndicator: true,
        };
    }

    // 9. Card due to expire soon
    if (hasCardExpiringSoon()) {
        return {
            status: PAYMENT_STATUSES.CARD_EXPIRE_SOON,
            shouldShowGreenDotIndicator: true,
        };
    }

    // 10. Retry billing success
    if (isRetryBillingSuccessful()) {
        return {
            status: PAYMENT_STATUSES.RETRY_BILLING_SUCCESS,
            isError: false,
        };
    }

    // 11. Retry billing error
    if (hasRetryBillingError()) {
        return {
            status: PAYMENT_STATUSES.RETRY_BILLING_ERROR,
            isError: true,
            shouldShowRedDotIndicator: true,
        };
    }

    // 12. Generic API error
    if (false) {
        return {
            status: PAYMENT_STATUSES.GENERIC_API_ERROR,
            isError: true,
            shouldShowRedDotIndicator: true,
        };
    }

    return {};
}

function hasSubscriptionRedDotError(): boolean {
    return getSubscriptionStatus()?.shouldShowRedDotIndicator ?? false;
}

function hasSubscriptionGreenDotInfo(): boolean {
    return getSubscriptionStatus()?.shouldShowRedDotIndicator ?? false;
}

/**
 * Calculates the remaining number of days of the workspace owner's free trial before it ends.
 */
function calculateRemainingFreeTrialDays(): number {
    if (!lastDayFreeTrial) {
        return 0;
    }

    const currentDate = new Date();
    const diffInSeconds = differenceInSeconds(parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, currentDate), currentDate);
    const diffInDays = Math.ceil(diffInSeconds / 86400);

    return diffInDays < 0 ? 0 : diffInDays;
}

/**
 * Whether the workspace's owner is on its free trial period.
 */
function isUserOnFreeTrial(): boolean {
    if (!firstDayFreeTrial || !lastDayFreeTrial) {
        return false;
    }

    const currentDate = new Date();
    const firstDayFreeTrialDate = parseDate(firstDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, currentDate);
    const lastDayFreeTrialDate = parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, currentDate);

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
    const lastDayFreeTrialDate = parseDate(lastDayFreeTrial, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING, currentDate);

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
    const currentDate = new Date();

    // This logic will be executed if the user is a workspace's non-owner (normal user or admin).
    // We should restrict the workspace's non-owner actions if it's member of a workspace where the owner is
    // past due and is past its grace period end.
    for (const userBillingGraceEndPeriodEntry of Object.entries(userBillingGraceEndPeriodCollection ?? {})) {
        const [entryKey, userBillingGracePeriodEnd] = userBillingGraceEndPeriodEntry;

        if (userBillingGracePeriodEnd && isAfter(currentDate, fromUnixTime(userBillingGracePeriodEnd.value))) {
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
    if (billingGracePeriod && amountOwed !== undefined && amountOwed > 0 && isAfter(currentDate, fromUnixTime(billingGracePeriod))) {
        return true;
    }

    return false;
}

export {
    calculateRemainingFreeTrialDays,
    doesUserHavePaymentCardAdded,
    hasUserFreeTrialEnded,
    isUserOnFreeTrial,
    shouldRestrictUserBillableActions,
    getSubscriptionStatus,
    hasSubscriptionRedDotError,
    getAmountOwed,
    getOverdueGracePeriodDate,
    getCardForSubscriptionBilling,
    hasSubscriptionGreenDotInfo,
    hasRetryBillingError,
    PAYMENT_STATUSES,
};
