type ToggleCardContinuousReconciliationParams = {
    policyAccountID: number;
    policyID: string;
    shouldUseContinuousReconciliation: boolean;
    expensifyCardContinuousReconciliationConnection?: string;
};

export default ToggleCardContinuousReconciliationParams;
