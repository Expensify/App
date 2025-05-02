import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type SetPolicyCategoryMaxAmountParams = {
    policyID: string;
    categoryName: string;
    maxExpenseAmount: number | null;
    expenseLimitType: PolicyCategoryExpenseLimitType;
};

export default SetPolicyCategoryMaxAmountParams;
