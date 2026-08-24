type ToggleTravelBillingContinuousReconciliationParams = {
    policyAccountID: number;
    shouldUseContinuousReconciliation: boolean;
    // The backend reads this request key, so it keeps the legacy spelling.
    travelInvoicingContinuousReconciliationConnection?: string;
};

export default ToggleTravelBillingContinuousReconciliationParams;
