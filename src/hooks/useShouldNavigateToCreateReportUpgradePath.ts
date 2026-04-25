import usePolicyForMovingExpenses from './usePolicyForMovingExpenses';

function useShouldNavigateToCreateReportUpgradePath() {
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses();

    return !policyForMovingExpensesID && !shouldSelectPolicy;
}

export default useShouldNavigateToCreateReportUpgradePath;
