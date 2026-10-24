import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {GroupedItem, SearchGroupBy} from './types';

/** The dates a time bucket covers */
type ChartBucketRange = {start: string; end: string};

type ChartGroupByConfig = {
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
    getFilterQuery: (item: GroupedItem) => string;

    /** Returns the dates a time-based group covers, as yyyy-MM-dd strings */
    getDateRange?: (item: GroupedItem) => ChartBucketRange | undefined;
};

/**
 * Chart-specific configuration for each groupBy type - defines how to extract label and build filter query
 * for displaying grouped transaction data in charts.
 */
const CHART_GROUP_BY_CONFIG: Record<SearchGroupBy, ChartGroupByConfig> = {
    [CONST.SEARCH.GROUP_BY.FROM]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.FROM ? (item.formattedFrom ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.FROM ? `from:${item.accountID}` : ''),
    },
    [CONST.SEARCH.GROUP_BY.CARD]: {
        titleIconName: 'CreditCard',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.CARD ? (item.formattedCardName ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.CARD ? `cardID:${item.cardID}` : ''),
    },
    [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: {
        titleIconName: 'Send',
        // eslint-disable-next-line rulesdir/no-default-id-values -- formattedWithdrawalID is a display label, not an Onyx ID
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID ? (item.formattedWithdrawalID ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID ? `withdrawalID:${item.entryID}` : ''),
    },
    [CONST.SEARCH.GROUP_BY.CATEGORY]: {
        titleIconName: 'Folder',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.CATEGORY ? (item.formattedCategory ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.CATEGORY ? `category:"${item.category}"` : ''),
    },
    [CONST.SEARCH.GROUP_BY.MERCHANT]: {
        titleIconName: 'Basket',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? (item.formattedMerchant ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? `merchant="${item.merchant}"` : ''),
    },
    [CONST.SEARCH.GROUP_BY.TAG]: {
        titleIconName: 'Tag',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.TAG ? (item.formattedTag ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.TAG ? `tag:"${item.tag}"` : ''),
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
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? (item.formattedMonth ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? item.shortFormattedMonth : undefined),
        axisLabelSteps: [1, 2, 3, 6],
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.MONTH) {
                return '';
            }
            const {start, end} = DateUtils.getMonthDateRange(item.year, item.month);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? DateUtils.getMonthDateRange(item.year, item.month) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? (item.formattedWeek ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.shortFormattedWeek : undefined),
        getLineChartLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.lineChartFormattedWeek : undefined),
        axisLabelSteps: [1, 2, 4],
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.WEEK) {
                return '';
            }
            const {start, end} = DateUtils.getWeekDateRange(item.week);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? DateUtils.getWeekDateRange(item.week) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? (item.formattedYear ?? '') : ''),
        axisLabelSteps: [1, 2, 5],
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.YEAR) {
                return '';
            }
            const {start, end} = DateUtils.getYearDateRange(item.year);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? DateUtils.getYearDateRange(item.year) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? (item.formattedQuarter ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.shortFormattedQuarter : undefined),
        axisLabelSteps: [1, 2, 4],
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.QUARTER) {
                return '';
            }
            const {start, end} = DateUtils.getQuarterDateRange(item.year, item.quarter);
            return `date>=${start} date<=${end}`;
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? DateUtils.getQuarterDateRange(item.year, item.quarter) : undefined),
    },
};

export default CHART_GROUP_BY_CONFIG;
export type {ChartBucketRange};
