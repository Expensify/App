import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {GroupedItem, SearchGroupBy} from './types';

type ChartGroupByConfig = {
    /** Name of the icon rendered next to the chart title */
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Basket' | 'Tag' | 'Calendar';

    /** Returns the full label for a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact label for chart axes, or undefined to fall back to `getLabel` */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Builds the query fragment appended to the current query to drill into a group's transactions */
    getFilterQuery: (item: GroupedItem) => string;
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
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MERCHANT ? `merchant:"${item.merchant}"` : ''),
    },
    [CONST.SEARCH.GROUP_BY.TAG]: {
        titleIconName: 'Tag',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.TAG ? (item.formattedTag ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.TAG ? `tag:"${item.tag}"` : ''),
    },
    [CONST.SEARCH.GROUP_BY.MONTH]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? (item.formattedMonth ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? item.shortFormattedMonth : undefined),
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.MONTH) {
                return '';
            }
            const {start, end} = DateUtils.getMonthDateRange(item.year, item.month);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? (item.formattedWeek ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.shortFormattedWeek : undefined),
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.WEEK) {
                return '';
            }
            const {start, end} = DateUtils.getWeekDateRange(item.week);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? (item.formattedYear ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.YEAR) {
                return '';
            }
            const {start, end} = DateUtils.getYearDateRange(item.year);
            return `date>=${start} date<=${end}`;
        },
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? (item.formattedQuarter ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.shortFormattedQuarter : undefined),
        getFilterQuery: (item: GroupedItem) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.QUARTER) {
                return '';
            }
            const {start, end} = DateUtils.getQuarterDateRange(item.year, item.quarter);
            return `date>=${start} date<=${end}`;
        },
    },
};

export default CHART_GROUP_BY_CONFIG;
