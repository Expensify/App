import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type Form from './Form';

const INPUT_IDS = {
    AMOUNT: 'amount',
    AMOUNT_MATCH_TYPE: 'amountMatchType',
    AMOUNT_TO_MATCH: 'amountToMatch',
    BILLABLE: 'billable',
    BILLABLE_TO_MATCH: 'billableToMatch',
    CATEGORY: 'category',
    CATEGORIES_TO_MATCH: 'categoriesToMatch',
    CARDS_TO_MATCH: 'cardsToMatch',
    CURRENCIES_TO_MATCH: 'currenciesToMatch',
    DATE_MATCH_TYPE: 'dateMatchType',
    DATE_TO_MATCH: 'dateToMatch',
    DESCRIPTION: 'comment',
    HAS_MATCH_TYPE: 'hasMatchType',
    HAS_TO_MATCH: 'hasToMatch',
    MATCH_TYPE: 'matchType',
    MERCHANT_TO_MATCH: 'merchantToMatch',
    MERCHANT_TYPES_TO_MATCH: 'merchantTypesToMatch',
    MERCHANT: 'merchant',
    REIMBURSABLE: 'reimbursable',
    REIMBURSABLE_TO_MATCH: 'reimbursableToMatch',
    SUBMITTERS_TO_MATCH: 'submittersToMatch',
    TAG: 'tag',
    TAGS_TO_MATCH: 'tagsToMatch',
    TAX: 'tax',
    TAX_RATES_TO_MATCH: 'taxRatesToMatch',
    VENDOR_ID: 'vendorID',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type MerchantRuleForm = Form<
    InputID,
    {
        [INPUT_IDS.AMOUNT]: string;
        [INPUT_IDS.AMOUNT_MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.AMOUNT_TO_MATCH]: string;
        [INPUT_IDS.BILLABLE]: boolean;
        [INPUT_IDS.BILLABLE_TO_MATCH]: boolean;
        [INPUT_IDS.CATEGORY]: string;
        [INPUT_IDS.CATEGORIES_TO_MATCH]: string[];
        [INPUT_IDS.CARDS_TO_MATCH]: string[];
        [INPUT_IDS.CURRENCIES_TO_MATCH]: string[];
        [INPUT_IDS.DATE_MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.DATE_TO_MATCH]: string;
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.HAS_MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.HAS_TO_MATCH]: string[];
        [INPUT_IDS.MATCH_TYPE]: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.MERCHANT_TO_MATCH]: string;
        [INPUT_IDS.MERCHANT_TYPES_TO_MATCH]: string[];
        [INPUT_IDS.REIMBURSABLE]: boolean;
        [INPUT_IDS.REIMBURSABLE_TO_MATCH]: boolean;
        [INPUT_IDS.SUBMITTERS_TO_MATCH]: string[];
        [INPUT_IDS.TAG]: string;
        [INPUT_IDS.TAGS_TO_MATCH]: string[];
        [INPUT_IDS.TAX]: string;
        [INPUT_IDS.TAX_RATES_TO_MATCH]: string[];
        [INPUT_IDS.VENDOR_ID]: string;
    }
>;

export type {MerchantRuleForm};
export default INPUT_IDS;
