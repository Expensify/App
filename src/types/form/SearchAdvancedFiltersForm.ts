import type {ValueOf} from 'type-fest';
import type Form from './Form';

const FILTER_KEYS = {
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
    FROM: 'from',
    TO: 'to',
} as const;

type InputID = ValueOf<typeof FILTER_KEYS>;

type SearchAdvancedFiltersForm = Form<
    InputID,
    {
        [FILTER_KEYS.DATE_AFTER]: string;
        [FILTER_KEYS.DATE_BEFORE]: string;
        [FILTER_KEYS.CURRENCY]: string[];
        [FILTER_KEYS.CATEGORY]: string[];
        [FILTER_KEYS.POLICY_ID]: string;
        [FILTER_KEYS.CARD_ID]: string[];
        [FILTER_KEYS.MERCHANT]: string;
        [FILTER_KEYS.DESCRIPTION]: string;
        [FILTER_KEYS.REPORT_ID]: string;
        [FILTER_KEYS.KEYWORD]: string;
        [FILTER_KEYS.TAX_RATE]: string[];
        [FILTER_KEYS.EXPENSE_TYPE]: string[];
        [FILTER_KEYS.TAG]: string[];
        [FILTER_KEYS.FROM]: string[];
        [FILTER_KEYS.TO]: string[];
    }
>;

export type {SearchAdvancedFiltersForm};
export default FILTER_KEYS;
