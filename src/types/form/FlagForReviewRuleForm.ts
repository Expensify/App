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
>;

export type {FlagForReviewRuleForm, FlagMerchantMatchType};
export default INPUT_IDS;
