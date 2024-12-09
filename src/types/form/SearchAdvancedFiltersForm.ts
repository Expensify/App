import type {ValueOf} from 'type-fest';
import type {SearchDateFilterKeys} from '@components/Search/types';
import CONST from '@src/CONST';
import type Form from './Form';

const DATE_FILTER_KEYS: SearchDateFilterKeys[] = [
    CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
];

const FILTER_KEYS = {
    TYPE: 'type',
    STATUS: 'status',
    DATE_AFTER: 'dateAfter',
    DATE_BEFORE: 'dateBefore',
    SUBMITTED_AFTER: 'submittedAfter',
    SUBMITTED_BEFORE: 'submittedBefore',
    APPROVED_AFTER: 'approvedAfter',
    APPROVED_BEFORE: 'approvedBefore',
    PAID_AFTER: 'paidAfter',
    PAID_BEFORE: 'paidBefore',
    EXPORTED_AFTER: 'exportedAfter',
    EXPORTED_BEFORE: 'exportedBefore',
    POSTED_AFTER: 'postedAfter',
    POSTED_BEFORE: 'postedBefore',
    CURRENCY: 'currency',
    CATEGORY: 'category',
    POLICY_ID: 'policyID',
    CARD_ID: 'cardID',
    MERCHANT: 'merchant',
    DESCRIPTION: 'description',
    REPORT_ID: 'reportID',
    LESS_THAN: 'lessThan',
    GREATER_THAN: 'greaterThan',
    TAX_RATE: 'taxRate',
    EXPENSE_TYPE: 'expenseType',
    TAG: 'tag',
    KEYWORD: 'keyword',
    FROM: 'from',
    TO: 'to',
    IN: 'in',
} as const;

type InputID = ValueOf<typeof FILTER_KEYS>;

type SearchAdvancedFiltersForm = Form<
    InputID,
    {
        [FILTER_KEYS.TYPE]: string;
        [FILTER_KEYS.STATUS]: string;
        [FILTER_KEYS.DATE_AFTER]: string;
        [FILTER_KEYS.DATE_BEFORE]: string;
        [FILTER_KEYS.SUBMITTED_AFTER]: string;
        [FILTER_KEYS.SUBMITTED_BEFORE]: string;
        [FILTER_KEYS.APPROVED_AFTER]: string;
        [FILTER_KEYS.APPROVED_BEFORE]: string;
        [FILTER_KEYS.PAID_AFTER]: string;
        [FILTER_KEYS.PAID_BEFORE]: string;
        [FILTER_KEYS.EXPORTED_AFTER]: string;
        [FILTER_KEYS.EXPORTED_BEFORE]: string;
        [FILTER_KEYS.POSTED_AFTER]: string;
        [FILTER_KEYS.POSTED_BEFORE]: string;
        [FILTER_KEYS.CURRENCY]: string[];
        [FILTER_KEYS.CATEGORY]: string[];
        [FILTER_KEYS.POLICY_ID]: string;
        [FILTER_KEYS.CARD_ID]: string[];
        [FILTER_KEYS.MERCHANT]: string;
        [FILTER_KEYS.DESCRIPTION]: string;
        [FILTER_KEYS.REPORT_ID]: string;
        [FILTER_KEYS.LESS_THAN]: string;
        [FILTER_KEYS.GREATER_THAN]: string;
        [FILTER_KEYS.KEYWORD]: string;
        [FILTER_KEYS.TAX_RATE]: string[];
        [FILTER_KEYS.EXPENSE_TYPE]: string[];
        [FILTER_KEYS.TAG]: string[];
        [FILTER_KEYS.FROM]: string[];
        [FILTER_KEYS.TO]: string[];
        [FILTER_KEYS.IN]: string[];
    }
>;

export type {SearchAdvancedFiltersForm};
export default FILTER_KEYS;
export {DATE_FILTER_KEYS};
