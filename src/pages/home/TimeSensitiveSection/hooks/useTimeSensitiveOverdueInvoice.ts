import useOnyx from '@hooks/useOnyx';

import {getSubscriptionStatus, PAYMENT_STATUS} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Surfaces an overdue subscription invoice to the billing owner. `ownerBillingGracePeriodEnd` is only set for the
 * policy owner, so this is inherently scoped to billing owners.
 */
function useTimeSensitiveOverdueInvoice() {
    const [amountOwed, amountOwedResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    // Only amountOwed/grace-period drive the invoicing statuses we care about, so other inputs are undefined. Travel
    // grace period is omitted too: it is higher priority and would otherwise mask this reminder when both apply.
    const subscriptionStatus = getSubscriptionStatus(undefined, undefined, undefined, undefined, undefined, undefined, amountOwed ?? 0, ownerBillingGracePeriodEnd, undefined);

    const isWithinGracePeriod = subscriptionStatus?.status === PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING;
    const isOverdue = subscriptionStatus?.status === PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE;

    // Wait for amountOwed to load: an unloaded NVP reads as 0, which qualifies as under-invoicing and would briefly
    // surface this reminder to an owner who actually owes money.
    const shouldShowOverdueInvoiceReminder = amountOwedResult.status === 'loaded' && (isWithinGracePeriod || isOverdue);

    return {
        shouldShowOverdueInvoiceReminder,
        isOverdue,
        invoiceGracePeriodEndUnixSeconds: ownerBillingGracePeriodEnd ?? 0,
    };
}

export default useTimeSensitiveOverdueInvoice;
