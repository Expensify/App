import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    BILLABLE: 'billable',
    CATEGORY: 'category',
    DESCRIPTION: 'comment',
    MATCH_TYPE: 'matchType',
    MERCHANT_TO_MATCH: 'merchantToMatch',
    MERCHANT: 'merchant',
    REIMBURSABLE: 'reimbursable',
    TAG: 'tag',
    TAX: 'tax',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MerchantRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.BILLABLE]: boolean;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MERCHANT_TO_MATCH]: string;
        [INPUT_IDS.REIMBURSABLE]: boolean;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.TAX]: string;
    }
>;

export type {MerchantRuleForm};
export default INPUT_IDS;
