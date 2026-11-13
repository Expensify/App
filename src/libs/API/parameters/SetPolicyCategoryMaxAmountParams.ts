import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type SetPolicyCategoryMaxAmountParams = {
    policyID: string;
    categoryName: string;
    maxExpenseAmount: number | null;
    expenseLimitType: PolicyCategoryExpenseLimitType;

    /** Optimistic action ID for the "Review your workspace settings" onboarding task the backend completes as a side effect */
    completedTaskReportActionID?: string;
};

export default SetPolicyCategoryMaxAmountParams;
