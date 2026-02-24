/** Billing status model */
type BillingStatus = {
    /** Status action */
    action: string;

    /** Billing period month */
    periodMonth: string;

    /** Billing period year */
    periodYear: string;

    /** Decline reason */
    declineReason: 'insufficient_funds' | 'expired_card';
};

export default BillingStatus;
