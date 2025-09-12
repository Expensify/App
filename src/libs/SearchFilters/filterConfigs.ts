import {updateAdvancedFilters} from '@libs/actions/Search';
import CONST from '@src/CONST';
import type {FilterConfig} from './types';

const FILTER_CONFIGS: Record<string, FilterConfig> = {
    // Date Preset Filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        titleKey: 'common.date',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
        titleKey: 'search.filters.submitted',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
        titleKey: 'search.filters.approved',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
        titleKey: 'search.filters.paid',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
        titleKey: 'search.filters.exported',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
        titleKey: 'search.filters.posted',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
        titleKey: 'search.filters.withdrawn',
        type: 'datePreset',
        dateKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
    },

    // Amount Filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
        titleKey: 'iou.amount',
        type: 'amount',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
        titleKey: 'search.filters.total',
        type: 'amount',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT,
        titleKey: 'search.filters.purchaseAmount',
        type: 'amount',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT,
    },

    // Text Filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
        titleKey: 'common.description',
        type: 'text',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
        characterLimit: CONST.DESCRIPTION_LIMIT,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
        titleKey: 'common.merchant',
        type: 'text',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
        titleKey: 'search.filters.keyword',
        type: 'text',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
        titleKey: 'common.reportID',
        type: 'text',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
        titleKey: 'common.title',
        type: 'text',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
        titleKey: 'search.filters.withdrawalID',
        type: 'text',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
    },

    // Boolean Filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
        titleKey: 'common.reimbursable',
        type: 'boolean',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE,
        titleKey: 'common.billable',
        type: 'boolean',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE,
    },

    // Complex filters (will be migrated to custom components later)
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
        titleKey: 'common.category',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCategoryPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
        titleKey: 'common.status',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersStatusPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
        titleKey: 'common.type',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersTypePage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_BY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_BY,
        titleKey: 'search.groupBy',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersGroupByPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
        titleKey: 'common.currency',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCurrencyPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY,
        titleKey: 'search.filters.groupCurrency',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersGroupCurrencyPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD,
        titleKey: 'common.card',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersCardPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
        titleKey: 'common.taxRate',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersTaxRatePage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
        titleKey: 'search.expenseType',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersExpenseTypePage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
        titleKey: 'search.filters.withdrawalType',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersWithdrawalTypePage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
        titleKey: 'common.tag',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersTagPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
        titleKey: 'search.filters.has',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersHasPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
        titleKey: 'common.from',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersFromPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TO]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
        titleKey: 'common.to',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersToPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.IN]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
        titleKey: 'common.in',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersInPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
        titleKey: 'common.assignee',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersAssigneePage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
        titleKey: 'common.workspace',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersWorkspacePage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY,
        titleKey: 'search.filters.purchaseCurrency',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersPurchaseCurrencyPage').default,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION,
        titleKey: 'search.filters.action',
        type: 'custom',
        component: () => require('@pages/Search/SearchAdvancedFiltersPage/SearchFiltersActionPage').default,
    },
};

function getFilterConfig(filterKey?: string): FilterConfig | undefined {
    if (!filterKey) {
        return undefined;
    }
    return FILTER_CONFIGS[filterKey];
}

function getAllFilterConfigs(): Record<string, FilterConfig> {
    return FILTER_CONFIGS;
}

export {getFilterConfig, getAllFilterConfigs};
export default FILTER_CONFIGS;