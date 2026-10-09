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
import type {GroupedItem, SearchGroupBy} from './types';

/** Calendar unit a time-bucketed group spans */
type ChartBucketUnit = 'day' | 'week' | 'month' | 'quarter' | 'year';

/** The dates a time bucket covers, empty when the item isn't the bucket the group-by plots */
type ChartBucketRange = {start: string; end: string};

const EMPTY_BUCKET_RANGE: ChartBucketRange = {start: '', end: ''};

function getDayBucketRange(item: GroupedItem): ChartBucketRange {
    return item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? {start: item.day, end: item.day} : EMPTY_BUCKET_RANGE;
}

function getMonthBucketRange(item: GroupedItem): ChartBucketRange {
    const monthItem = item as TransactionMonthGroupListItemType;
    return DateUtils.getMonthDateRange(monthItem.year, monthItem.month);
}

function getWeekBucketRange(item: GroupedItem): ChartBucketRange {
    return DateUtils.getWeekDateRange((item as TransactionWeekGroupListItemType).week);
}

function getQuarterBucketRange(item: GroupedItem): ChartBucketRange {
    const quarterItem = item as TransactionQuarterGroupListItemType;
    return DateUtils.getQuarterDateRange(quarterItem.year, quarterItem.quarter);
}

function getYearBucketRange(item: GroupedItem): ChartBucketRange {
    return DateUtils.getYearDateRange((item as TransactionYearGroupListItemType).year);
}

/** The query fragment narrowing a search to the dates a bucket covers. */
function buildBucketDateFilter(range: ChartBucketRange): string {
    return range.start && range.end ? `date>=${range.start} date<=${range.end}` : '';
}

type ChartGroupByConfig = {
    /** Name of the icon rendered next to the chart title */
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Basket' | 'Tag' | 'Calendar';

    /** Returns the full label for a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact label for chart axes, or undefined to fall back to `getLabel` */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Builds the query fragment appended to the current query to drill into a group's transactions */
    getFilterQuery: (item: GroupedItem) => string;

    /** Calendar unit one group spans, left out by the group-bys that rank rather than bucket time */
    bucketUnit?: ChartBucketUnit;

    /** The dates one group covers, set together with `bucketUnit` */
    getBucketRange?: (item: GroupedItem) => ChartBucketRange;
};

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts.
 */
const CHART_GROUP_BY_CONFIG: Record<SearchGroupBy, ChartGroupByConfig> = {
    [CONST.SEARCH.GROUP_BY.FROM]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item as TransactionMemberGroupListItemType).formattedFrom ?? '',
        getFilterQuery: (item: GroupedItem) => `from:${(item as TransactionMemberGroupListItemType).accountID}`,
    },
    [CONST.SEARCH.GROUP_BY.CARD]: {
        titleIconName: 'CreditCard',
        getLabel: (item: GroupedItem) => (item as TransactionCardGroupListItemType).formattedCardName ?? '',
        getFilterQuery: (item: GroupedItem) => `cardID:${(item as TransactionCardGroupListItemType).cardID}`,
    },
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: {
        titleIconName: 'Send',
        // eslint-disable-next-line rulesdir/no-default-id-values -- formattedWithdrawalID is a display label, not an Onyx ID
        getLabel: (item: GroupedItem) => (item as TransactionWithdrawalIDGroupListItemType).formattedWithdrawalID ?? '',
        getFilterQuery: (item: GroupedItem) => `withdrawalID:${(item as TransactionWithdrawalIDGroupListItemType).entryID}`,
    },
    [CONST.SEARCH.GROUP_BY.CATEGORY]: {
        titleIconName: 'Folder',
        getLabel: (item: GroupedItem) => (item as TransactionCategoryGroupListItemType).formattedCategory ?? '',
        getFilterQuery: (item: GroupedItem) => `category:"${(item as TransactionCategoryGroupListItemType).category}"`,
    },
    [CONST.SEARCH.GROUP_BY.MERCHANT]: {
        titleIconName: 'Basket',
        getLabel: (item: GroupedItem) => (item as TransactionMerchantGroupListItemType).formattedMerchant ?? '',
        getFilterQuery: (item: GroupedItem) => `merchant:"${(item as TransactionMerchantGroupListItemType).merchant}"`,
    },
    [CONST.SEARCH.GROUP_BY.TAG]: {
        titleIconName: 'Tag',
        getLabel: (item: GroupedItem) => (item as TransactionTagGroupListItemType).formattedTag ?? '',
        getFilterQuery: (item: GroupedItem) => `tag:"${(item as TransactionTagGroupListItemType).tag}"`,
    },
    [CONST.SEARCH.GROUP_BY.DAY]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.formattedDay : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.shortFormattedDay : undefined),
        getFilterQuery: (item: GroupedItem) => buildBucketDateFilter(getDayBucketRange(item)),
        bucketUnit: 'day',
        getBucketRange: getDayBucketRange,
    },
    [CONST.SEARCH.GROUP_BY.MONTH]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionMonthGroupListItemType).formattedMonth ?? '',
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? item.shortFormattedMonth : undefined),
        getFilterQuery: (item: GroupedItem) => buildBucketDateFilter(getMonthBucketRange(item)),
        bucketUnit: 'month',
        getBucketRange: getMonthBucketRange,
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionWeekGroupListItemType).formattedWeek ?? '',
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.shortFormattedWeek : undefined),
        getFilterQuery: (item: GroupedItem) => buildBucketDateFilter(getWeekBucketRange(item)),
        bucketUnit: 'week',
        getBucketRange: getWeekBucketRange,
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionYearGroupListItemType).formattedYear ?? '',
        getFilterQuery: (item: GroupedItem) => buildBucketDateFilter(getYearBucketRange(item)),
        bucketUnit: 'year',
        getBucketRange: getYearBucketRange,
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item as TransactionQuarterGroupListItemType).formattedQuarter ?? '',
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.shortFormattedQuarter : undefined),
        getFilterQuery: (item: GroupedItem) => buildBucketDateFilter(getQuarterBucketRange(item)),
        bucketUnit: 'quarter',
        getBucketRange: getQuarterBucketRange,
    },
};

export default CHART_GROUP_BY_CONFIG;
export type {ChartBucketRange, ChartBucketUnit};
