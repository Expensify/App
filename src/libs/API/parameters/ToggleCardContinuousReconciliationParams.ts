type ToggleCardContinuousReconciliationParams = {
    policyAccountID: number;
    policyID: string;
    shouldUseContinuousReconciliation: boolean;
    expensifyCardContinuousReconciliationConnection?: string;
    expensifyCardLiabilityAccountID?: string;
};

export default ToggleCardContinuousReconciliationParams;
