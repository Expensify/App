import Onyx from 'react-native-onyx';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Fund} from '@src/types/onyx';

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

let billingGracePeriod: OnyxValues[typeof ONYXKEYS.NVP_PRIVATE_BILLING_GRACE_PERIOD_END];
Onyx.connect({
    key: ONYXKEYS.NVP_PRIVATE_BILLING_GRACE_PERIOD_END,
    callback: (value) => {
        if (!value) {
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

function getOverdueGracePeriodDate(): string {
    return billingGracePeriod ?? '';
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

export default {
    getSubscriptionStatus,
    hasSubscriptionRedDotError,
    getAmountOwed,
    getOverdueGracePeriodDate,
    getCardForSubscriptionBilling,
    hasSubscriptionGreenDotInfo,
    PAYMENT_STATUSES,
};
