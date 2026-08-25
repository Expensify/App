/** Billing status model */
type BillingStatus = {
    action: string;

    periodMonth: string;

    periodYear: string;

    declineReason: 'insufficient_funds' | 'expired_card';
};

export default BillingStatus;
