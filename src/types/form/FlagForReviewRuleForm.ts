import type {EditableConditions} from '@libs/ExpenseDefaultRuleUtils';

import type CONST from '@src/CONST';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';
import type {FlagRuleEnforcement} from '@src/types/onyx/Rule';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    CATEGORY: 'category',
    MAX_EXPENSE_AMOUNT: 'maxExpenseAmount',
    EXPENSE_LIMIT_TYPE: 'expenseLimitType',
    MERCHANT: 'merchantToMatch',
    MATCH_TYPE: 'matchType',
    ENFORCEMENT: 'enforcement',
    CURRENCY: 'currency',
    DRAFT_KEY: 'draftKey',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;
type FlagMerchantMatchType = typeof CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO | typeof CONST.SEARCH.SYNTAX_OPERATORS.CONTAINS;

type FlagRuleMatchingConditions = Omit<EditableConditions, 'merchantToMatch' | 'matchType' | 'categoriesToMatch' | 'amountMatchType' | 'reimbursableToMatch' | 'billableToMatch'>;

type FlagForReviewRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.MAX_EXPENSE_AMOUNT]: string;
        [INPUT_IDS.EXPENSE_LIMIT_TYPE]: PolicyCategoryExpenseLimitType;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MATCH_TYPE]: FlagMerchantMatchType;
        [INPUT_IDS.ENFORCEMENT]: FlagRuleEnforcement | 'legacy';
        [INPUT_IDS.CURRENCY]: string;
        [INPUT_IDS.DRAFT_KEY]: string;
    }
> &
    FlagRuleMatchingConditions & {
        /** An empty value clears a saved condition when the picker is opened from a direct link. */
        reimbursableToMatch?: boolean | '';
        billableToMatch?: boolean | '';
        dailyBudgetToMatch?: string;
        /** One-based dimension of the exact tag selected for a daily budget. */
        budgetTagLevel?: number;
    };

export type {FlagForReviewRuleForm, FlagMerchantMatchType};
export default INPUT_IDS;
