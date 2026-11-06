import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {GroupedItem, SearchGroupBy} from './types';

/** The dates a time bucket covers */
type ChartBucketRange = {start: string; end: string};

type ChartGroupByConfig<TFilterItem extends GroupedItem = GroupedItem> = {
    /** Name of the icon rendered next to the chart title */
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Basket' | 'Tag' | 'Calendar';

    /** Returns the full label for a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact label for chart axes, or undefined to fall back to `getLabel` */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns the line chart axis label, or undefined to fall back to `getShortLabel` */
    getLineChartLabel?: (item: GroupedItem) => string | undefined;

    /** Intervals, in groups, the line chart may label its x-axis at. The smallest one that fits is used. */
    axisLabelSteps?: readonly number[];

    /** Builds the query fragment appended to the current query to drill into a group's transactions */
    getFilterQuery: (item: TFilterItem) => string;

    /** Returns the dates a time-based group covers, as yyyy-MM-dd strings */
    getDateRange?: (item: GroupedItem) => ChartBucketRange | undefined;
};

type ChartFilterItem<TGroupBy extends SearchGroupBy> = TGroupBy extends typeof CONST.SEARCH.GROUP_BY.WEEK
    ? Extract<GroupedItem, {week: string}>
    : TGroupBy extends typeof CONST.SEARCH.GROUP_BY.MONTH
      ? Extract<GroupedItem, {month: number; year: number}>
      : TGroupBy extends typeof CONST.SEARCH.GROUP_BY.QUARTER
        ? Extract<GroupedItem, {quarter: number; year: number}>
        : TGroupBy extends typeof CONST.SEARCH.GROUP_BY.YEAR
          ? Extract<GroupedItem, {year: number}>
          : GroupedItem;

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts.
 */
const CHART_GROUP_BY_CONFIG: {[TGroupBy in SearchGroupBy]: ChartGroupByConfig<ChartFilterItem<TGroupBy>>} = {
    [CONST.SEARCH.GROUP_BY.FROM]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => ('formattedFrom' in item ? item.formattedFrom : undefined) ?? '',
        getFilterQuery: (item: GroupedItem) => `from:${'accountID' in item ? item.accountID : undefined}`,
    },
    [CONST.SEARCH.GROUP_BY.CARD]: {
        titleIconName: 'CreditCard',
        getLabel: (item: GroupedItem) => ('formattedCardName' in item ? item.formattedCardName : undefined) ?? '',
        getFilterQuery: (item: GroupedItem) => `cardID:${'cardID' in item ? item.cardID : undefined}`,
    },
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: {
        titleIconName: 'Send',
        getLabel: (item: GroupedItem) => ('formattedWithdrawalID' in item ? item.formattedWithdrawalID : undefined) ?? '',
        getFilterQuery: (item: GroupedItem) => `withdrawalID:${'entryID' in item ? item.entryID : undefined}`,
    },
    [CONST.SEARCH.GROUP_BY.CATEGORY]: {
        titleIconName: 'Folder',
        getLabel: (item: GroupedItem) => ('formattedCategory' in item ? item.formattedCategory : undefined) ?? '',
        getFilterQuery: (item: GroupedItem) => `category:"${'category' in item ? item.category : undefined}"`,
    },
    [CONST.SEARCH.GROUP_BY.MERCHANT]: {
        titleIconName: 'Basket',
        getLabel: (item: GroupedItem) => ('formattedMerchant' in item ? item.formattedMerchant : undefined) ?? '',
        getFilterQuery: (item: GroupedItem) => `merchant="${'merchant' in item ? item.merchant : undefined}"`,
    },
    [CONST.SEARCH.GROUP_BY.TAG]: {
        titleIconName: 'Tag',
        getLabel: (item: GroupedItem) => ('formattedTag' in item ? item.formattedTag : undefined) ?? '',
        getFilterQuery: (item: GroupedItem) => `tag:"${'tag' in item ? item.tag : undefined}"`,
    },
    [CONST.SEARCH.GROUP_BY.DAY]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.formattedDay : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.shortFormattedDay : undefined),
        getLineChartLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.lineChartFormattedDay : undefined),
        axisLabelSteps: [1, 2, 7, 14],
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? `date>=${item.day} date<=${item.day}` : ''),
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? {start: item.day, end: item.day} : undefined),
    },
    [CONST.SEARCH.GROUP_BY.MONTH]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => ('formattedMonth' in item ? item.formattedMonth : undefined) ?? '',
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? item.shortFormattedMonth : undefined),
        axisLabelSteps: [1, 2, 3, 6],
        getFilterQuery: (item: Extract<GroupedItem, {month: number; year: number}>) => {
            const {start, end} = DateUtils.getMonthDateRange(item.year, item.month);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? DateUtils.getMonthDateRange(item.year, item.month) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => ('formattedWeek' in item ? item.formattedWeek : undefined) ?? '',
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.shortFormattedWeek : undefined),
        getLineChartLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.lineChartFormattedWeek : undefined),
        axisLabelSteps: [1, 2, 4],
        getFilterQuery: (item: Extract<GroupedItem, {week: string}>) => {
            const {start, end} = DateUtils.getWeekDateRange(item.week);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? DateUtils.getWeekDateRange(item.week) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => ('formattedYear' in item ? item.formattedYear : undefined) ?? '',
        axisLabelSteps: [1, 2, 5],
        getFilterQuery: (item: Extract<GroupedItem, {year: number}>) => {
            const {start, end} = DateUtils.getYearDateRange(item.year);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? DateUtils.getYearDateRange(item.year) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => ('formattedQuarter' in item ? item.formattedQuarter : undefined) ?? '',
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.shortFormattedQuarter : undefined),
        axisLabelSteps: [1, 2, 4],
        getFilterQuery: (item: Extract<GroupedItem, {quarter: number; year: number}>) => {
            const {start, end} = DateUtils.getQuarterDateRange(item.year, item.quarter);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? DateUtils.getQuarterDateRange(item.year, item.quarter) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.APPROVER]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.APPROVER ? (item.formattedApprover ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.APPROVER ? `${CONST.SEARCH.GROUP_BY.APPROVER}:${item.accountID}` : ''),
    },
};

/**
 * Dispatches on the chart's grouping, because a row's own `groupedBy` can differ: expense report rows keep theirs in any chart.
 * A time chart filters only its own rows, so any other row has no filter.
 */
function getChartFilterQuery(item: GroupedItem, groupBy: SearchGroupBy): string {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.WEEK:
            return item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.WEEK].getFilterQuery(item) : '';
        case CONST.SEARCH.GROUP_BY.MONTH:
            return item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MONTH].getFilterQuery(item) : '';
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.QUARTER].getFilterQuery(item) : '';
        case CONST.SEARCH.GROUP_BY.YEAR:
            return item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.YEAR].getFilterQuery(item) : '';
        default:
            return CHART_GROUP_BY_CONFIG[groupBy].getFilterQuery(item);
    }
}

export default CHART_GROUP_BY_CONFIG;
export {getChartFilterQuery};
export type {ChartBucketRange};
