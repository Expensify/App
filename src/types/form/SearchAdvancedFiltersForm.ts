import type {ValueOf} from 'type-fest';
import type Form from './Form';

const INPUT_IDS = {
    DATE_AFTER: 'dateAfter',
    DATE_BEFORE: 'dateBefore',
    CURRENCY: 'currency',
    CATEGORY: 'category',
    POLICY_ID: 'policyID',
    CARD_ID: 'cardID',
    MERCHANT: 'merchant',
    DESCRIPTION: 'description',
    REPORT_ID: 'reportID',
    TAX_RATE: 'taxRate',
    EXPENSE_TYPE: 'expenseType',
    TAG: 'tag',
    KEYWORD: 'keyword',
} as const;

type InputID = ValueOf<typeof INPUT_IDS>;

type SearchAdvancedFiltersForm = Form<
    InputID,
    {
        [INPUT_IDS.DATE_AFTER]: string;
        [INPUT_IDS.DATE_BEFORE]: string;
        [INPUT_IDS.CURRENCY]: string[];
        [INPUT_IDS.CATEGORY]: string[];
        [INPUT_IDS.POLICY_ID]: string;
        [INPUT_IDS.CARD_ID]: string[];
        [INPUT_IDS.MERCHANT]: string;
        [INPUT_IDS.DESCRIPTION]: string;
        [INPUT_IDS.REPORT_ID]: string;
        [INPUT_IDS.KEYWORD]: string;
        [INPUT_IDS.TAX_RATE]: string[];
        [INPUT_IDS.EXPENSE_TYPE]: string[];
        [INPUT_IDS.TAG]: string[];
    }
>;

export type {SearchAdvancedFiltersForm};
export default INPUT_IDS;
