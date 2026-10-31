import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    AMOUNT: 'amount',
    BILLABLE: 'billable',
    CATEGORY: 'category',
    CATEGORIES_TO_MATCH: 'categoriesToMatch',
    DESCRIPTION: 'comment',
    MATCH_TYPE: 'matchType',
    MERCHANT_TO_MATCH: 'merchantToMatch',
    MERCHANT: 'merchant',
    REIMBURSABLE: 'reimbursable',
    TAG: 'tag',
    TAGS_TO_MATCH: 'tagsToMatch',
    TAX: 'tax',
    VENDOR_ID: 'vendorID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MerchantRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.AMOUNT]: string;
        [INPUT_IDS.BILLABLE]: boolean;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.CATEGORIES_TO_MATCH]: string[];
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MERCHANT_TO_MATCH]: string;
        [INPUT_IDS.REIMBURSABLE]: boolean;
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.TAGS_TO_MATCH]: string[];
        [INPUT_IDS.TAX]: string;
        [INPUT_IDS.VENDOR_ID]: string;
    }
>;

export type {MerchantRuleForm};
export default INPUT_IDS;
