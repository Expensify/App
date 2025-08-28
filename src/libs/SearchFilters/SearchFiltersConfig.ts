/**
 * Configuration-driven Search Filters System
 * 
 * This file demonstrates the new configuration approach for search filters.
 * Adding a new filter is now as simple as adding a new entry to this configuration.
 */

import type {SearchFilterKey} from '@components/Search/types';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

// Configuration for all search filters
export const SEARCH_FILTER_CONFIG = {
    // General filters
    type: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
        titleKey: 'common.type' as TranslationPaths,
        section: 'general',
        component: 'singleSelect',
    },
    groupBy: {
        key: CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_GROUP_BY,
        titleKey: 'search.groupBy' as TranslationPaths,
        section: 'general',
        component: 'singleSelect',
    },
    status: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_STATUS,
        titleKey: 'common.status' as TranslationPaths,
        section: 'general',
        component: 'multiSelect',
    },
    keyword: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_KEYWORD,
        titleKey: 'search.filters.hasKeywords' as TranslationPaths,
        section: 'general',
        component: 'textInput',
    },
    date: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
        titleKey: 'common.date' as TranslationPaths,
        section: 'general',
        component: 'datePicker',
    },
    from: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,
        titleKey: 'common.from' as TranslationPaths,
        section: 'general',
        component: 'participants',
    },
    to: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TO,
        titleKey: 'common.to' as TranslationPaths,
        section: 'general',
        component: 'participants',
    },
    policyID: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WORKSPACE,
        titleKey: 'workspace.common.workspace' as TranslationPaths,
        section: 'general',
        component: 'multiSelect',
    },

    // Expense filters
    merchant: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_MERCHANT,
        titleKey: 'common.merchant' as TranslationPaths,
        section: 'expenses',
        component: 'textInput',
    },
    amount: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_AMOUNT,
        titleKey: 'iou.amount' as TranslationPaths,
        section: 'expenses',
        component: 'amountRange',
    },
    currency: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CURRENCY,
        titleKey: 'common.currency' as TranslationPaths,
        section: 'expenses',
        component: 'multiSelect',
    },
    category: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CATEGORY,
        titleKey: 'common.category' as TranslationPaths,
        section: 'expenses',
        component: 'multiSelect',
    },
    tag: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAG,
        titleKey: 'common.tag' as TranslationPaths,
        section: 'expenses',
        component: 'multiSelect',
    },
    description: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIPTION,
        titleKey: 'common.description' as TranslationPaths,
        section: 'expenses',
        component: 'textInput',
    },

    // Report filters  
    reportID: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_REPORT_ID,
        titleKey: 'common.reportID' as TranslationPaths,
        section: 'reports',
        component: 'textInput',
    },
    total: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TOTAL,
        titleKey: 'common.total' as TranslationPaths,
        section: 'reports',
        component: 'amountRange',
    },
    submitted: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_SUBMITTED,
        titleKey: 'search.filters.submitted' as TranslationPaths,
        section: 'reports',
        component: 'datePicker',
    },
    approved: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_APPROVED,
        titleKey: 'search.filters.approved' as TranslationPaths,
        section: 'reports',
        component: 'datePicker',
    },
    paid: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_PAID,
        titleKey: 'search.filters.paid' as TranslationPaths,
        section: 'reports',
        component: 'datePicker',
    },
    exported: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPORTED,
        titleKey: 'search.filters.exported' as TranslationPaths,
        section: 'reports',
        component: 'datePicker',
    },
} as const;

/**
 * Get all filters for a specific section
 */
export function getFiltersForSection(section: 'general' | 'expenses' | 'reports') {
    return Object.values(SEARCH_FILTER_CONFIG).filter(config => config.section === section);
}

/**
 * Get filter configuration by key
 */
export function getFilterConfigByKey(key: SearchFilterKey) {
    return Object.values(SEARCH_FILTER_CONFIG).find(config => config.key === key);
}

/**
 * Example of how simple it is to add a new filter:
 * 
 * Just add this to SEARCH_FILTER_CONFIG:
 * 
 * newFilter: {
 *     key: CONST.SEARCH.SYNTAX_FILTER_KEYS.NEW_FILTER,
 *     route: ROUTES.SEARCH_ADVANCED_FILTERS_NEW_FILTER,
 *     titleKey: 'search.filters.newFilter',
 *     section: 'expenses',
 *     component: 'textInput',
 * },
 * 
 * That's it! No need to:
 * - Create a new page component
 * - Add routes to multiple files  
 * - Update navigation config
 * - Modify the AdvancedSearchFilters component
 * - Add conditional logic
 */