import useOnyx from '@hooks/useOnyx';

import {getSubscriptionStatus, PAYMENT_STATUS} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Surfaces an overdue subscription invoice to the billing owner. The `OWNER_OF_POLICY_UNDER_INVOICING` status is
 * derived from `ownerBillingGracePeriodEnd`, an NVP that is only set for the policy owner, so this is inherently
 * scoped to billing owners.
 */
function useTimeSensitiveOverdueInvoice() {
    const [amountOwed, amountOwedResult] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);

    // Only the amountOwed/grace-period branch of getSubscriptionStatus can return the invoicing statuses below, so the
    // remaining inputs are passed as undefined. The travel grace period is also omitted: it is an independent,
    // higher-priority status that would otherwise mask the subscription-invoice reminder when an owner owes on both.
    const subscriptionStatus = getSubscriptionStatus(undefined, undefined, undefined, undefined, undefined, undefined, amountOwed ?? 0, ownerBillingGracePeriodEnd, undefined);

    const isWithinGracePeriod = subscriptionStatus?.status === PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING;
    const isOverdue = subscriptionStatus?.status === PAYMENT_STATUS.OWNER_OF_POLICY_UNDER_INVOICING_OVERDUE;

    // Wait for amountOwed to hydrate: an unloaded NVP reads as 0, the exact value that qualifies as under-invoicing,
    // which would briefly surface this reminder to an owner who actually owes money (a higher-priority billing status).
    const shouldShowOverdueInvoiceReminder = amountOwedResult.status === 'loaded' && (isWithinGracePeriod || isOverdue);

    return {
        shouldShowOverdueInvoiceReminder,
        isOverdue,
        invoiceGracePeriodEndUnixSeconds: ownerBillingGracePeriodEnd ?? 0,
    };
}

export default useTimeSensitiveOverdueInvoice;
