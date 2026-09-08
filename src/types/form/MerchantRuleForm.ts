import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    BILLABLE: 'billable',
    CATEGORY: 'category',
    CATEGORIES_TO_MATCH: 'categoriesToMatch',
    DESCRIPTION: 'comment',
    MATCH_TYPE: 'matchType',
    MERCHANT_TO_MATCH: 'merchantToMatch',
    MERCHANT: 'merchant',
    REIMBURSABLE: 'reimbursable',
    RULE_TYPE: 'ruleType',
    TAG: 'tag',
    TAX: 'tax',
    VENDOR_ID: 'vendorID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

/** What the rule matches on, chosen before the editor opens. */
type ExpenseDefaultRuleType = ValueOf<typeof CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE>;

type MerchantRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.BILLABLE]: boolean;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.CATEGORIES_TO_MATCH]: string[];
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MERCHANT_TO_MATCH]: string;
        [INPUT_IDS.REIMBURSABLE]: boolean;
        /** Which kind of expense default this is, chosen before the editor opened. Kept in the draft so it survives a
         * trip to any picker, rather than having to ride on every picker's route. */
        [INPUT_IDS.RULE_TYPE]: ExpenseDefaultRuleType;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.TAX]: string;
        [INPUT_IDS.VENDOR_ID]: string;
    }
>;

export type {ExpenseDefaultRuleType, MerchantRuleForm};
export default INPUT_IDS;
