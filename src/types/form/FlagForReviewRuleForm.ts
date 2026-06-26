import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type FlagForReviewRuleForm = {
    category?: string;
    maxExpenseAmount?: string;
    expenseLimitType?: PolicyCategoryExpenseLimitType;
};

export type {FlagForReviewRuleForm};
