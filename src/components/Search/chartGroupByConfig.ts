import DateUtils from '@libs/DateUtils';
import CONST from '@src/CONST';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from './SearchList/ListItem/types';
import type {GroupedItem, SearchFilterKey, SearchGroupBy} from './types';

type ChartGroupByConfig = {
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Basket' | 'Tag' | 'Calendar';
    getLabel: (item: GroupedItem) => string;
    filterKey: SearchFilterKey;
    getFilterQuery: (item: GroupedItem) => string;
};

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts.
 */
const CHART_GROUP_BY_CONFIG: Record<SearchGroupBy, ChartGroupByConfig> = {
    [CONST.SEARCH.GROUP_BY.FROM]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item as TransactionMemberGroupListItemType).formattedFrom ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
        getFilterQuery: (item: GroupedItem) => `from:${(item as TransactionMemberGroupListItemType).accountID}`,
    },
    [CONST.SEARCH.GROUP_BY.CARD]: {
        titleIconName: 'CreditCard',
        getLabel: (item: GroupedItem) => (item as TransactionCardGroupListItemType).formattedCardName ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
        getFilterQuery: (item: GroupedItem) => `cardID:${(item as TransactionCardGroupListItemType).cardID}`,
    },
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: {
        titleIconName: 'Send',
        // eslint-disable-next-line rulesdir/no-default-id-values -- formattedWithdrawalID is a display label, not an Onyx ID
        getLabel: (item: GroupedItem) => (item as TransactionWithdrawalIDGroupListItemType).formattedWithdrawalID ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
        getFilterQuery: (item: GroupedItem) => `withdrawalID:${(item as TransactionWithdrawalIDGroupListItemType).entryID}`,
    },
    [CONST.SEARCH.GROUP_BY.CATEGORY]: {
        titleIconName: 'Folder',
        getLabel: (item: GroupedItem) => (item as TransactionCategoryGroupListItemType).formattedCategory ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
        getFilterQuery: (item: GroupedItem) => `category:"${(item as TransactionCategoryGroupListItemType).category}"`,
    },
    [CONST.SEARCH.GROUP_BY.MERCHANT]: {
        titleIconName: 'Basket',
        getLabel: (item: GroupedItem) => (item as TransactionMerchantGroupListItemType).formattedMerchant ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
        getFilterQuery: (item: GroupedItem) => `merchant:"${(item as TransactionMerchantGroupListItemType).merchant}"`,
    },
    [CONST.SEARCH.GROUP_BY.TAG]: {
        titleIconName: 'Tag',
        getLabel: (item: GroupedItem) => (item as TransactionTagGroupListItemType).formattedTag ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
        getFilterQuery: (item: GroupedItem) => `tag:"${(item as TransactionTagGroupListItemType).tag}"`,
    },
    [CONST.SEARCH.GROUP_BY.MONTH]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionMonthGroupListItemType).formattedMonth ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        getFilterQuery: (item: GroupedItem) => {
            const monthItem = item as TransactionMonthGroupListItemType;
            const {start, end} = DateUtils.getMonthDateRange(monthItem.year, monthItem.month);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionWeekGroupListItemType).formattedWeek ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        getFilterQuery: (item: GroupedItem) => {
            const weekItem = item as TransactionWeekGroupListItemType;
            const {start, end} = DateUtils.getWeekDateRange(weekItem.week);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionYearGroupListItemType).formattedYear ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        getFilterQuery: (item: GroupedItem) => {
            const yearItem = item as TransactionYearGroupListItemType;
            const {start, end} = DateUtils.getYearDateRange(yearItem.year);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionQuarterGroupListItemType).formattedQuarter ?? '',
        filterKey: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        getFilterQuery: (item: GroupedItem) => {
            const quarterItem = item as TransactionQuarterGroupListItemType;
            const {start, end} = DateUtils.getQuarterDateRange(quarterItem.year, quarterItem.quarter);
            return `date>=${start} date<=${end}`;
        },
    },
};

export default CHART_GROUP_BY_CONFIG;
