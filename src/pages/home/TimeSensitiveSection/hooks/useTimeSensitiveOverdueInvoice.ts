import useOnyx from '@hooks/useOnyx';

import {getSubscriptionStatus, PAYMENT_STATUS} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Surfaces an overdue subscription invoice to the billing owner. The `OWNER_OF_POLICY_UNDER_INVOICING` status is
 * derived from `ownerBillingGracePeriodEnd`, an NVP that is only set for the policy owner, so this is inherently
 * scoped to billing owners.
 */
function useTimeSensitiveOverdueInvoice() {
    const [stripeCustomerID] = useOnyx(ONYXKEYS.NVP_PRIVATE_STRIPE_CUSTOMER_ID);
    const [retryBillingSuccessful] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_SUCCESSFUL);
    const [retryBillingFailed] = useOnyx(ONYXKEYS.SUBSCRIPTION_RETRY_BILLING_STATUS_FAILED);
    const [billingDisputePending] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_DISPUTE_PENDING);
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const [billingStatus] = useOnyx(ONYXKEYS.NVP_PRIVATE_BILLING_STATUS);
    const [amountOwed = 0] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    // Intentionally omit the travel grace period: it is an independent, higher-priority status in getSubscriptionStatus
    // and would otherwise mask the subscription-invoice reminder when an owner owes on both at once.
    const subscriptionStatus = getSubscriptionStatus(
        stripeCustomerID,
        retryBillingSuccessful,
        billingDisputePending,
        retryBillingFailed,
        fundList,
        billingStatus,
        amountOwed,
        ownerBillingGracePeriodEnd,
        undefined,
    );

    const shouldShowOverdueInvoice = subscriptionStatus?.status === PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING && !!ownerBillingGracePeriodEnd;

    return {
        shouldShowOverdueInvoice,
        ownerBillingGracePeriodEnd,
    };
}

export default useTimeSensitiveOverdueInvoice;
