import type {ValueOf} from 'type-fest';
import type {OnyxCollection} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchFilterKey, SearchGroupBy} from '@components/Search/types';
import type {WorkspaceListItem} from '@hooks/useWorkspaceList';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {CardList, PersonalDetailsList, Report} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

type FilterComponentType = 
    | 'TextInput'
    | 'SingleSelect'
    | 'MultiSelect' 
    | 'DatePicker'
    | 'AmountRange'
    | 'Participants'
    | 'Boolean'
    | 'Reports';

type FilterDependencies = {
    filters: Partial<SearchAdvancedFiltersForm>;
    translate: LocaleContextProps['translate'];
    localeCompare: LocaleContextProps['localeCompare'];
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    personalDetails?: PersonalDetailsList;
    policies?: WorkspaceListItem[];
    cards?: CardList;
    taxRates?: Record<string, string[]>;
    reports?: OnyxCollection<Report>;
    currentType?: SearchDataTypes;
    groupBy?: SearchGroupBy;
};

type FilterConfig = {
    key: SearchFilterKey;
    route: string;
    titleKey: TranslationPaths;
    descriptionKey: TranslationPaths;
    component: FilterComponentType;
    section: 'general' | 'expenses' | 'reports';
    dataTypes: SearchDataTypes[];
    getValues?: (dependencies: FilterDependencies) => Array<{text: string; value: string}>;
    getTitleDisplay?: (dependencies: FilterDependencies) => string | undefined;
    shouldShow?: (dependencies: FilterDependencies) => boolean;
};

const SEARCH_FILTERS_CONFIG: Record<SearchFilterKey, FilterConfig> = {
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
        titleKey: 'common.type' as const,
        descriptionKey: 'common.type' as const,
        component: 'SingleSelect',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
        getValues: () => Object.values(CONST.SEARCH.DATA_TYPES).map(type => ({
            text: type,
            value: type,
        })),
        getTitleDisplay: ({filters, translate}) => {
            const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE];
            return filterValue ? translate(`common.${filterValue as ValueOf<typeof CONST.SEARCH.DATA_TYPES>}`) : undefined;
        },
    },
    [CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY]: {
        key: CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_GROUP_BY,
        titleKey: 'search.groupBy' as const,
        descriptionKey: 'search.groupBy' as const,
        component: 'SingleSelect',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.TRIP],
        getTitleDisplay: ({filters, translate}) => {
            const filterValue = filters[CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY];
            return filterValue ? translate(`search.filters.groupBy.${filterValue}`) : undefined;
        },
        shouldShow: ({groupBy}) => !!groupBy && groupBy !== CONST.SEARCH.GROUP_BY.REPORTS,
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_STATUS,
        titleKey: 'common.status' as const,
        descriptionKey: 'common.status' as const,
        component: 'MultiSelect',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
        titleKey: 'common.date' as const,
        descriptionKey: 'common.date' as const,
        component: 'DatePicker',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_KEYWORD,
        titleKey: 'search.filters.hasKeywords' as const,
        descriptionKey: 'search.filters.hasKeywords' as const,
        component: 'TextInput',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT],
        getTitleDisplay: ({filters}) => filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,
        titleKey: 'common.from' as const,
        descriptionKey: 'common.from' as const,
        component: 'Participants',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TO]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TO,
        titleKey: 'common.to' as const,
        descriptionKey: 'common.to' as const,
        component: 'Participants',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.IN]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_IN,
        titleKey: 'common.in' as const,
        descriptionKey: 'common.in' as const,
        component: 'Reports',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WORKSPACE,
        titleKey: 'workspace.common.workspace' as const,
        descriptionKey: 'workspace.common.workspace' as const,
        component: 'MultiSelect',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_GROUP_CURRENCY,
        titleKey: 'common.groupCurrency' as const,
        descriptionKey: 'common.groupCurrency' as const,
        component: 'MultiSelect',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.TRIP],
        shouldShow: ({groupBy}) => !!groupBy && groupBy !== CONST.SEARCH.GROUP_BY.REPORTS,
    },
    // Expense filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE,
        titleKey: 'search.expenseType' as const,
        descriptionKey: 'search.expenseType' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_MERCHANT,
        titleKey: 'common.merchant' as const,
        descriptionKey: 'common.merchant' as const,
        component: 'TextInput',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
        getTitleDisplay: ({filters}) => filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_AMOUNT,
        titleKey: 'iou.amount' as const,
        descriptionKey: 'iou.amount' as const,
        component: 'AmountRange',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CURRENCY,
        titleKey: 'common.currency' as const,
        descriptionKey: 'common.currency' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CATEGORY,
        titleKey: 'common.category' as const,
        descriptionKey: 'common.category' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAG,
        titleKey: 'common.tag' as const,
        descriptionKey: 'common.tag' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_DESCRIPTION,
        titleKey: 'common.description' as const,
        descriptionKey: 'common.description' as const,
        component: 'TextInput',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.TASK],
        getTitleDisplay: ({filters}) => filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CARD,
        titleKey: 'common.card' as const,
        descriptionKey: 'common.card' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_POSTED,
        titleKey: 'search.filters.posted' as const,
        descriptionKey: 'search.filters.posted' as const,
        component: 'DatePicker',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TAX_RATE,
        titleKey: 'workspace.taxes.taxRate' as const,
        descriptionKey: 'workspace.taxes.taxRate' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_REIMBURSABLE,
        titleKey: 'common.reimbursable' as const,
        descriptionKey: 'common.reimbursable' as const,
        component: 'Boolean',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_BILLABLE,
        titleKey: 'common.billable' as const,
        descriptionKey: 'common.billable' as const,
        component: 'Boolean',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE],
    },
    // Report filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_REPORT_ID,
        titleKey: 'common.reportID' as const,
        descriptionKey: 'common.reportID' as const,
        component: 'TextInput',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
        getTitleDisplay: ({filters}) => filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TOTAL,
        titleKey: 'common.total' as const,
        descriptionKey: 'common.total' as const,
        component: 'AmountRange',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_SUBMITTED,
        titleKey: 'search.filters.submitted' as const,
        descriptionKey: 'search.filters.submitted' as const,
        component: 'DatePicker',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_APPROVED,
        titleKey: 'search.filters.approved' as const,
        descriptionKey: 'search.filters.approved' as const,
        component: 'DatePicker',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_PAID,
        titleKey: 'search.filters.paid' as const,
        descriptionKey: 'search.filters.paid' as const,
        component: 'DatePicker',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_EXPORTED,
        titleKey: 'search.filters.exported' as const,
        descriptionKey: 'search.filters.exported' as const,
        component: 'DatePicker',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WITHDRAWAL_TYPE,
        titleKey: 'search.withdrawalType' as const,
        descriptionKey: 'search.withdrawalType' as const,
        component: 'SingleSelect',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE],
        getTitleDisplay: ({filters, translate}) => {
            const filterValue = filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE];
            return filterValue ? translate(`search.filters.withdrawalType.${filterValue}`) : undefined;
        },
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_WITHDRAWN,
        titleKey: 'search.filters.withdrawn' as const,
        descriptionKey: 'search.filters.withdrawn' as const,
        component: 'DatePicker',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE],
    },
    // Task specific filters
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_TITLE,
        titleKey: 'common.title' as const,
        descriptionKey: 'common.title' as const,
        component: 'TextInput',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.TASK],
        getTitleDisplay: ({filters}) => filters[CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_ASSIGNEE,
        titleKey: 'common.assignee' as const,
        descriptionKey: 'common.assignee' as const,
        component: 'Participants',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.TASK],
    },
    // Additional filters that need to be added
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_CARD,  // Reusing card route
        titleKey: 'common.card' as const,
        descriptionKey: 'common.card' as const,
        component: 'MultiSelect',
        section: 'expenses',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,  // Reusing from route
        titleKey: 'common.from' as const,
        descriptionKey: 'common.from' as const,
        component: 'Participants',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_FROM,  // Reusing from route
        titleKey: 'common.from' as const,
        descriptionKey: 'common.from' as const,
        component: 'Participants',
        section: 'reports',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE],
    },
    [CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION]: {
        key: CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION,
        route: ROUTES.SEARCH_ADVANCED_FILTERS_STATUS,  // Reusing status route
        titleKey: 'common.status' as const,
        descriptionKey: 'common.status' as const,
        component: 'SingleSelect',
        section: 'general',
        dataTypes: [CONST.SEARCH.DATA_TYPES.EXPENSE, CONST.SEARCH.DATA_TYPES.INVOICE, CONST.SEARCH.DATA_TYPES.TRIP, CONST.SEARCH.DATA_TYPES.CHAT, CONST.SEARCH.DATA_TYPES.TASK],
    },
};

/**
 * Get filter configuration for a specific filter key
 */
function getFilterConfig(key: SearchFilterKey): FilterConfig | undefined {
    return SEARCH_FILTERS_CONFIG[key];
}

/**
 * Get all filter configurations for a specific data type and section
 */
function getFiltersForTypeAndSection(dataType: SearchDataTypes, section: 'general' | 'expenses' | 'reports'): FilterConfig[] {
    return Object.values(SEARCH_FILTERS_CONFIG).filter(
        config => config.section === section && config.dataTypes.includes(dataType)
    );
}

/**
 * Get all filters grouped by section for a specific data type
 */
function getFiltersGroupedBySection(dataType: SearchDataTypes): Record<'general' | 'expenses' | 'reports', FilterConfig[]> {
    return {
        general: getFiltersForTypeAndSection(dataType, 'general'),
        expenses: getFiltersForTypeAndSection(dataType, 'expenses'),
        reports: getFiltersForTypeAndSection(dataType, 'reports'),
    };
}

export {
    SEARCH_FILTERS_CONFIG,
    getFilterConfig,
    getFiltersForTypeAndSection,
    getFiltersGroupedBySection,
};

export type {
    FilterConfig,
    FilterComponentType,
    FilterDependencies,
};