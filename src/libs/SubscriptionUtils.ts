import {differenceInSeconds, fromUnixTime, isAfter, isBefore} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, BillingStatus, Fund, FundList, Policy, StripeCustomerID} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {translateLocal} from './Localize';
import * as PolicyUtils from './PolicyUtils';

const PAYMENT_STATUS = {
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
} as const;

let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserAccountID = value?.accountID ?? -1;
    },
});

let amountOwed: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    callback: (value) => (amountOwed = value),
});

let stripeCustomerId: OnyxEntry<StripeCustomerID>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID,
    callback: (value) => {
        if (!value) {
            return;
        }

        stripeCustomerId = value;
    },
});

let billingDisputePending: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING,
    callback: (value) => (billingDisputePending = value),
});

let billingStatus: OnyxEntry<BillingStatus>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_STATUS,
    callback: (value) => (billingStatus = value),
});

let ownerBillingGraceEndPeriod: OnyxEntry<number>;
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => (ownerBillingGraceEndPeriod = value),
});

let fundList: OnyxEntry<FundList>;
Onyx.connect({
    key: ONYXKEYS.FUND_LIST,
    callback: (value) => {
        if (!value) {
            return;
        }

        fundList = value;
    },
});

let retryBillingSuccessful: OnyxEntry<boolean>;
Onyx.connect({
    key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL,
    initWithStoredValues: false,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        retryBillingSuccessful = value;
    },
});

let retryBillingFailed: OnyxEntry<boolean>;
Onyx.connect({
    key: ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED,
    callback: (value) => {
        if (value === undefined) {
            return;
        }

        retryBillingFailed = value;
    },
    initWithStoredValues: false,
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

/**
 * @returns The date when the grace period ends.
 */
function getOverdueGracePeriodDate(): OnyxEntry<number> {
    return ownerBillingGraceEndPeriod;
}

/**
 * @returns Whether the workspace owner has an overdue grace period.
 */
function hasOverdueGracePeriod(): boolean {
    return !!ownerBillingGraceEndPeriod ?? false;
}

/**
 * @returns Whether the workspace owner's grace period is overdue.
 */
function hasGracePeriodOverdue(): boolean {
    return !!ownerBillingGraceEndPeriod && Date.now() > new Date(ownerBillingGraceEndPeriod).getTime();
}

/**
 * @returns The amount owed by the workspace owner.
 */
function getAmountOwed(): number {
    return amountOwed ?? 0;
}

/**
 * @returns Whether there is an amount owed by the workspace owner.
 */
function hasAmountOwed(): boolean {
    return !!amountOwed;
}

/**
 * @returns Whether there is a card authentication error.
 */
function hasCardAuthenticatedError() {
    return stripeCustomerId?.status === 'authentication_required' && getAmountOwed() === 0;
}

/**
 * @returns Whether there is a billing dispute pending.
 */
function hasBillingDisputePending() {
    return !!billingDisputePending ?? false;
}

/**
 * @returns Whether there is a card expired error.
 */
function hasCardExpiredError() {
    return billingStatus?.declineReason === 'expired_card' && amountOwed !== 0;
}

/**
 * @returns Whether there is an insufficient funds error.
 */
function hasInsufficientFundsError() {
    return billingStatus?.declineReason === 'insufficient_funds' && amountOwed !== 0;
}

function shouldShowPreTrialBillingBanner(): boolean {
    return !isUserOnFreeTrial() && !hasUserFreeTrialEnded();
}
/**
 * @returns The card to be used for subscription billing.
 */
function getCardForSubscriptionBilling(): Fund | undefined {
    return Object.values(fundList ?? {}).find((card) => card?.accountData?.additionalData?.isBillingCard);
}

/**
 * @returns Whether the card is due to expire soon.
 */
function hasCardExpiringSoon(): boolean {
    if (!isEmptyObject(billingStatus)) {
        return false;
    }

    const card = getCardForSubscriptionBilling();

    if (!card) {
        return false;
    }

    const cardYear = card?.accountData?.cardYear;
    const cardMonth = card?.accountData?.cardMonth;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const isExpiringThisMonth = cardYear === currentYear && cardMonth === currentMonth;
    const isExpiringNextMonth = cardYear === (currentMonth === 12 ? currentYear + 1 : currentYear) && cardMonth === (currentMonth === 12 ? 1 : currentMonth + 1);

    return isExpiringThisMonth || isExpiringNextMonth;
}

/**
 * @returns Whether there is a retry billing error.
 */
function hasRetryBillingError(): boolean {
    return !!retryBillingFailed ?? false;
}

/**
 * @returns Whether the retry billing was successful.
 */
function isRetryBillingSuccessful(): boolean {
    return !!retryBillingSuccessful ?? false;
}

type SubscriptionStatus = {
    status: string;
    isError?: boolean;
};

/**
 * @returns The subscription status.
 */
function getSubscriptionStatus(): SubscriptionStatus | undefined {
    if (hasOverdueGracePeriod()) {
        if (hasAmountOwed()) {
            // 1. Policy owner with amount owed, within grace period
            if (!hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED,
                    isError: true,
                };
            }

            // 2. Policy owner with amount owed, overdue (past grace period)
            if (hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.POLICY_OWNER_WITH_AMOUNT_OWED_OVERDUE,
                };
            }
        } else {
            // 3. Owner of policy under invoicing, within grace period
            if (!hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING,
                };
            }

            // 4. Owner of policy under invoicing, overdue (past grace period)
            if (hasGracePeriodOverdue()) {
                return {
                    status: PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE,
                };
            }
        }
    }
    // 5. Billing disputed by cardholder
    if (hasBillingDisputePending()) {
        return {
            status: PAYMENT_STATUS.BILLING_DISPUTE_PENDING,
        };
    }

    // 6. Card not authenticated
    if (hasCardAuthenticatedError()) {
        return {
            status: PAYMENT_STATUS.CARD_AUTHENTICATION_REQUIRED,
        };
    }

    // 7. Insufficient funds
    if (hasInsufficientFundsError()) {
        return {
            status: PAYMENT_STATUS.INSUFFICIENT_FUNDS,
        };
    }

    // 8. Card expired
    if (hasCardExpiredError()) {
        return {
            status: PAYMENT_STATUS.CARD_EXPIRED,
        };
    }

    // 9. Card due to expire soon
    if (hasCardExpiringSoon()) {
        return {
            status: PAYMENT_STATUS.CARD_EXPIRE_SOON,
        };
    }

    // 10. Retry billing success
    if (isRetryBillingSuccessful()) {
        return {
            status: PAYMENT_STATUS.RETRY_BILLING_SUCCESS,
            isError: false,
        };
    }

    // 11. Retry billing error
    if (hasRetryBillingError()) {
        return {
            status: PAYMENT_STATUS.RETRY_BILLING_ERROR,
            isError: true,
        };
    }

    return undefined;
}

/**
 * @returns Whether there is a subscription red dot error.
 */
function hasSubscriptionRedDotError(): boolean {
    return getSubscriptionStatus()?.isError ?? false;
}

/**
 * @returns Whether there is a subscription green dot info.
 */
function hasSubscriptionGreenDotInfo(): boolean {
    return getSubscriptionStatus()?.isError === false;
}

/**
 * Calculates the remaining number of days of the workspace owner's free trial before it ends.
 */
function calculateRemainingFreeTrialDays(): number {
    if (!lastDayFreeTrial) {
        return 0;
    }

    const currentDate = new Date();
    const lastDayFreeTrialDate = new Date(`${lastDayFreeTrial}Z`);
    const diffInSeconds = differenceInSeconds(lastDayFreeTrialDate, currentDate);
    const diffInDays = Math.ceil(diffInSeconds / 86400);

    return diffInDays < 0 ? 0 : diffInDays;
}

/**
 * @param policies - The policies collection.
 * @returns The free trial badge text .
 */
function getFreeTrialText(policies: OnyxCollection<Policy> | null): string | undefined {
    const ownedPaidPolicies = PolicyUtils.getOwnedPaidPolicies(policies, currentUserAccountID);
    if (isEmptyObject(ownedPaidPolicies)) {
        return undefined;
    }

    if (shouldShowPreTrialBillingBanner()) {
        return translateLocal('subscription.billingBanner.preTrial.title');
    }
    if (isUserOnFreeTrial()) {
        return translateLocal('subscription.billingBanner.trialStarted.title', {numOfDays: calculateRemainingFreeTrialDays()});
    }

    return undefined;
}

/**
 * Whether the workspace's owner is on its free trial period.
 */
function isUserOnFreeTrial(): boolean {
    if (!firstDayFreeTrial || !lastDayFreeTrial) {
        return false;
    }

    const currentDate = new Date();

    // Free Trials are stored in UTC so the below code will convert the provided UTC datetime to local time
    const firstDayFreeTrialDate = new Date(`${firstDayFreeTrial}Z`);
    const lastDayFreeTrialDate = new Date(`${lastDayFreeTrial}Z`);

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
    const lastDayFreeTrialDate = new Date(`${lastDayFreeTrial}Z`);

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

    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];

    // This logic will be executed if the user is a workspace's non-owner (normal user or admin).
    // We should restrict the workspace's non-owner actions if it's member of a workspace where the owner is
    // past due and is past its grace period end.
    for (const userBillingGraceEndPeriodEntry of Object.entries(userBillingGraceEndPeriodCollection ?? {})) {
        const [entryKey, userBillingGracePeriodEnd] = userBillingGraceEndPeriodEntry;

        if (userBillingGracePeriodEnd && isAfter(currentDate, fromUnixTime(userBillingGracePeriodEnd.value))) {
            // Extracts the owner account ID from the collection member key.
            const ownerAccountID = Number(entryKey.slice(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END.length));

            if (PolicyUtils.isPolicyOwner(policy, ownerAccountID)) {
                return true;
            }
        }
    }

    // If it reached here it means that the user is actually the workspace's owner.
    // We should restrict the workspace's owner actions if it's past its grace period end date and it's owing some amount.
    if (
        PolicyUtils.isPolicyOwner(policy, currentUserAccountID) &&
        ownerBillingGraceEndPeriod &&
        amountOwed !== undefined &&
        amountOwed > 0 &&
        isAfter(currentDate, fromUnixTime(ownerBillingGraceEndPeriod))
    ) {
        return true;
    }

    return false;
}

export {
    calculateRemainingFreeTrialDays,
    doesUserHavePaymentCardAdded,
    getAmountOwed,
    getCardForSubscriptionBilling,
    getFreeTrialText,
    getOverdueGracePeriodDate,
    getSubscriptionStatus,
    hasCardAuthenticatedError,
    hasRetryBillingError,
    hasSubscriptionGreenDotInfo,
    hasSubscriptionRedDotError,
    hasUserFreeTrialEnded,
    isUserOnFreeTrial,
    PAYMENT_STATUS,
    shouldRestrictUserBillableActions,
    shouldShowPreTrialBillingBanner,
};
