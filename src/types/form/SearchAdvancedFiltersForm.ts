import type {ValueOf} from 'type-fest';
import type {SearchDateFilterKeys, SearchGroupBy} from '@components/Search/types';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
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
    GROUP_BY: 'groupBy',
    TYPE: 'type',
    STATUS: 'status',
    DATE_ON: 'dateOn',
    DATE_AFTER: 'dateAfter',
    DATE_BEFORE: 'dateBefore',
    SUBMITTED_ON: 'submittedOn',
    SUBMITTED_AFTER: 'submittedAfter',
    SUBMITTED_BEFORE: 'submittedBefore',
    APPROVED_ON: 'approvedOn',
    APPROVED_AFTER: 'approvedAfter',
    APPROVED_BEFORE: 'approvedBefore',
    PAID_ON: 'paidOn',
    PAID_AFTER: 'paidAfter',
    PAID_BEFORE: 'paidBefore',
    EXPORTED_ON: 'exportedOn',
    EXPORTED_AFTER: 'exportedAfter',
    EXPORTED_BEFORE: 'exportedBefore',
    POSTED_ON: 'postedOn',
    POSTED_AFTER: 'postedAfter',
    POSTED_BEFORE: 'postedBefore',
    CURRENCY: 'currency',
    GROUP_CURRENCY: 'groupCurrency',
    CATEGORY: 'category',
    POLICY_ID: 'policyID',
    CARD_ID: 'cardID',
    FEED: 'feed',
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
    PAYER: 'payer',
    EXPORTER: 'exporter',
    IN: 'in',
    TITLE: 'title',
    ASSIGNEE: 'assignee',
    REIMBURSABLE: 'reimbursable',
    BILLABLE: 'billable',
    ACTION: 'action',
} as const;

const ALLOWED_TYPE_FILTERS = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: [
        FILTER_KEYS.TYPE,
        FILTER_KEYS.STATUS,
        FILTER_KEYS.FROM,
        FILTER_KEYS.TO,
        FILTER_KEYS.KEYWORD,
        FILTER_KEYS.POLICY_ID,
        FILTER_KEYS.EXPENSE_TYPE,
        FILTER_KEYS.MERCHANT,
        FILTER_KEYS.DATE_ON,
        FILTER_KEYS.DATE_AFTER,
        FILTER_KEYS.DATE_BEFORE,
        FILTER_KEYS.GREATER_THAN,
        FILTER_KEYS.LESS_THAN,
        FILTER_KEYS.CURRENCY,
        FILTER_KEYS.GROUP_CURRENCY,
        FILTER_KEYS.CATEGORY,
        FILTER_KEYS.TAG,
        FILTER_KEYS.PAYER,
        FILTER_KEYS.DESCRIPTION,
        FILTER_KEYS.CARD_ID,
        FILTER_KEYS.FEED,
        FILTER_KEYS.POSTED_AFTER,
        FILTER_KEYS.POSTED_BEFORE,
        FILTER_KEYS.POSTED_ON,
        FILTER_KEYS.TAX_RATE,
        FILTER_KEYS.REIMBURSABLE,
        FILTER_KEYS.BILLABLE,
        FILTER_KEYS.REPORT_ID,
        FILTER_KEYS.SUBMITTED_ON,
        FILTER_KEYS.SUBMITTED_AFTER,
        FILTER_KEYS.SUBMITTED_BEFORE,
        FILTER_KEYS.APPROVED_AFTER,
        FILTER_KEYS.APPROVED_BEFORE,
        FILTER_KEYS.APPROVED_ON,
        FILTER_KEYS.PAID_AFTER,
        FILTER_KEYS.PAID_BEFORE,
        FILTER_KEYS.PAID_ON,
        FILTER_KEYS.EXPORTED_AFTER,
        FILTER_KEYS.EXPORTED_BEFORE,
        FILTER_KEYS.EXPORTED_ON,
        FILTER_KEYS.EXPORTER,
        FILTER_KEYS.GROUP_BY,
        FILTER_KEYS.FEED,
        FILTER_KEYS.ACTION,
    ],
    [CONST.SEARCH.DATA_TYPES.INVOICE]: [
        FILTER_KEYS.TYPE,
        FILTER_KEYS.STATUS,
        FILTER_KEYS.FROM,
        FILTER_KEYS.TO,
        FILTER_KEYS.KEYWORD,
        FILTER_KEYS.POLICY_ID,
        FILTER_KEYS.MERCHANT,
        FILTER_KEYS.DATE_ON,
        FILTER_KEYS.DATE_AFTER,
        FILTER_KEYS.DATE_BEFORE,
        FILTER_KEYS.GREATER_THAN,
        FILTER_KEYS.LESS_THAN,
        FILTER_KEYS.CURRENCY,
        FILTER_KEYS.CATEGORY,
        FILTER_KEYS.TAG,
        FILTER_KEYS.PAYER,
        FILTER_KEYS.DESCRIPTION,
        FILTER_KEYS.CARD_ID,
        FILTER_KEYS.FEED,
        FILTER_KEYS.POSTED_AFTER,
        FILTER_KEYS.POSTED_BEFORE,
        FILTER_KEYS.POSTED_ON,
        FILTER_KEYS.TAX_RATE,
        FILTER_KEYS.REPORT_ID,
        FILTER_KEYS.SUBMITTED_ON,
        FILTER_KEYS.SUBMITTED_AFTER,
        FILTER_KEYS.SUBMITTED_BEFORE,
        FILTER_KEYS.APPROVED_AFTER,
        FILTER_KEYS.APPROVED_BEFORE,
        FILTER_KEYS.APPROVED_ON,
        FILTER_KEYS.PAID_AFTER,
        FILTER_KEYS.PAID_BEFORE,
        FILTER_KEYS.PAID_ON,
        FILTER_KEYS.EXPORTED_AFTER,
        FILTER_KEYS.EXPORTED_BEFORE,
        FILTER_KEYS.EXPORTED_ON,
        FILTER_KEYS.EXPORTER,
        FILTER_KEYS.ACTION,
    ],
    [CONST.SEARCH.DATA_TYPES.TRIP]: [
        FILTER_KEYS.TYPE,
        FILTER_KEYS.STATUS,
        FILTER_KEYS.FROM,
        FILTER_KEYS.TO,
        FILTER_KEYS.KEYWORD,
        FILTER_KEYS.POLICY_ID,
        FILTER_KEYS.MERCHANT,
        FILTER_KEYS.DATE_ON,
        FILTER_KEYS.DATE_AFTER,
        FILTER_KEYS.DATE_BEFORE,
        FILTER_KEYS.GREATER_THAN,
        FILTER_KEYS.LESS_THAN,
        FILTER_KEYS.CURRENCY,
        FILTER_KEYS.GROUP_CURRENCY,
        FILTER_KEYS.CATEGORY,
        FILTER_KEYS.TAG,
        FILTER_KEYS.PAYER,
        FILTER_KEYS.DESCRIPTION,
        FILTER_KEYS.CARD_ID,
        FILTER_KEYS.FEED,
        FILTER_KEYS.POSTED_AFTER,
        FILTER_KEYS.POSTED_BEFORE,
        FILTER_KEYS.POSTED_ON,
        FILTER_KEYS.TAX_RATE,
        FILTER_KEYS.REPORT_ID,
        FILTER_KEYS.SUBMITTED_ON,
        FILTER_KEYS.SUBMITTED_AFTER,
        FILTER_KEYS.SUBMITTED_BEFORE,
        FILTER_KEYS.APPROVED_AFTER,
        FILTER_KEYS.APPROVED_BEFORE,
        FILTER_KEYS.APPROVED_ON,
        FILTER_KEYS.PAID_AFTER,
        FILTER_KEYS.PAID_BEFORE,
        FILTER_KEYS.PAID_ON,
        FILTER_KEYS.EXPORTED_AFTER,
        FILTER_KEYS.EXPORTED_BEFORE,
        FILTER_KEYS.EXPORTED_ON,
        FILTER_KEYS.EXPORTER,
        FILTER_KEYS.GROUP_BY,
        FILTER_KEYS.FEED,
        FILTER_KEYS.ACTION,
    ],
    [CONST.SEARCH.DATA_TYPES.CHAT]: [
        FILTER_KEYS.TYPE,
        FILTER_KEYS.STATUS,
        FILTER_KEYS.FROM,
        FILTER_KEYS.TO,
        FILTER_KEYS.IN,
        FILTER_KEYS.KEYWORD,
        FILTER_KEYS.POLICY_ID,
        FILTER_KEYS.DATE_AFTER,
        FILTER_KEYS.DATE_BEFORE,
        FILTER_KEYS.DATE_ON,
    ],
    [CONST.SEARCH.DATA_TYPES.TASK]: [
        FILTER_KEYS.TYPE,
        FILTER_KEYS.STATUS,
        FILTER_KEYS.TITLE,
        FILTER_KEYS.DESCRIPTION,
        FILTER_KEYS.IN,
        FILTER_KEYS.FROM,
        FILTER_KEYS.ASSIGNEE,
        FILTER_KEYS.DATE_ON,
        FILTER_KEYS.DATE_AFTER,
        FILTER_KEYS.DATE_BEFORE,
    ],
};

type SearchAdvancedFiltersKey = ValueOf<typeof FILTER_KEYS>;

type SearchAdvancedFiltersForm = Form<
    SearchAdvancedFiltersKey,
    {
        [FILTER_KEYS.GROUP_BY]: SearchGroupBy;
        [FILTER_KEYS.TYPE]: SearchDataTypes;
        [FILTER_KEYS.STATUS]: string[] | string;
        [FILTER_KEYS.DATE_AFTER]: string;
        [FILTER_KEYS.DATE_BEFORE]: string;
        [FILTER_KEYS.DATE_ON]: string;
        [FILTER_KEYS.SUBMITTED_ON]: string;
        [FILTER_KEYS.SUBMITTED_AFTER]: string;
        [FILTER_KEYS.SUBMITTED_BEFORE]: string;
        [FILTER_KEYS.APPROVED_ON]: string;
        [FILTER_KEYS.APPROVED_AFTER]: string;
        [FILTER_KEYS.APPROVED_BEFORE]: string;
        [FILTER_KEYS.PAID_ON]: string;
        [FILTER_KEYS.PAID_AFTER]: string;
        [FILTER_KEYS.PAID_BEFORE]: string;
        [FILTER_KEYS.EXPORTED_ON]: string;
        [FILTER_KEYS.EXPORTED_AFTER]: string;
        [FILTER_KEYS.EXPORTED_BEFORE]: string;
        [FILTER_KEYS.POSTED_ON]: string;
        [FILTER_KEYS.POSTED_AFTER]: string;
        [FILTER_KEYS.POSTED_BEFORE]: string;
        [FILTER_KEYS.CURRENCY]: string[];
        [FILTER_KEYS.GROUP_CURRENCY]: string;
        [FILTER_KEYS.CATEGORY]: string[];
        [FILTER_KEYS.POLICY_ID]: string[];
        [FILTER_KEYS.CARD_ID]: string[];
        [FILTER_KEYS.FEED]: string[];
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
        [FILTER_KEYS.PAYER]: string;
        [FILTER_KEYS.EXPORTER]: string[];
        [FILTER_KEYS.TO]: string[];
        [FILTER_KEYS.IN]: string[];
        [FILTER_KEYS.TITLE]: string;
        [FILTER_KEYS.ASSIGNEE]: string[];
        [FILTER_KEYS.REIMBURSABLE]: string;
        [FILTER_KEYS.BILLABLE]: string;
        [FILTER_KEYS.ACTION]: string;
    }
>;

export type {SearchAdvancedFiltersForm, SearchAdvancedFiltersKey};
export default FILTER_KEYS;
export {DATE_FILTER_KEYS, ALLOWED_TYPE_FILTERS, FILTER_KEYS};
