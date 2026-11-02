import type {ValueOf} from 'type-fest';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import type Form from './Form';

const INPUT_IDS = {
    CATEGORY: 'category',
    MAX_EXPENSE_AMOUNT: 'maxExpenseAmount',
    EXPENSE_LIMIT_TYPE: 'expenseLimitType',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type FlagForReviewRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: string;
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: PolicyCategoryExpenseLimitType;
    }
>;

export type {FlagForReviewRuleForm};
export default INPUT_IDS;
