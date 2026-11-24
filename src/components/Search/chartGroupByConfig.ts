import DateUtils from '@libs/DateUtils';
import {sanitizeSearchValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchTagGroup} from '@src/types/onyx/SearchResults';

import type {GroupedItem, SearchDateFilterKeys, SearchGroupBy} from './types';

/** Returns the value a tag group is filtered by. Grouped snapshots use an empty string or "(untagged)", but Search filters require "none" for missing tags. */
function getTagFilterValue(tag: string): string {
    return tag === '' || tag === CONST.SEARCH.TAG_UNTAGGED_GROUP_VALUE ? CONST.SEARCH.TAG_EMPTY_VALUE : tag;
}

/** Builds the query fragment narrowing a query to a tag group's expenses. */
function buildTagFilterQuery({tag, tagLevel, parentTagPath}: Pick<SearchTagGroup, 'tag' | 'tagLevel' | 'parentTagPath'>): string {
    if (tagLevel !== undefined) {
        return `tag:${sanitizeSearchValue(tag)} tagLevel:${tagLevel} tagParent:${sanitizeSearchValue(parentTagPath ?? '') || '""'}`;
    }
    return `tag:${sanitizeSearchValue(getTagFilterValue(tag))}`;
}

/** The dates a time bucket covers */
type ChartBucketRange = {start: string; end: string};

/** Builds the query fragment that narrows the given date to a time bucket */
function buildBucketFilterQuery({start, end}: ChartBucketRange, dateFilterKey: SearchDateFilterKeys = CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE): string {
    return `${dateFilterKey}>=${start} ${dateFilterKey}<=${end}`;
}

type ChartGroupByConfig = {
    /** Name of the icon rendered next to the chart title */
    titleIconName: 'Users' | 'CreditCard' | 'Send' | 'Folder' | 'Basket' | 'Tag' | 'Calendar' | 'Exclamation';

    /** Returns the full label for a group */
    getLabel: (item: GroupedItem) => string;

    /** Returns the compact label for chart axes, or undefined to fall back to `getLabel` */
    getShortLabel?: (item: GroupedItem) => string | undefined;

    /** Returns the line chart axis label, or undefined to fall back to `getShortLabel` */
    getLineChartLabel?: (item: GroupedItem) => string | undefined;

    /** Intervals, in groups, the line chart may label its x-axis at. The smallest one that fits is used. */
    axisLabelSteps?: readonly number[];

    /** Builds the query fragment appended to the current query to drill into a group's transactions. A time bucket narrows `dateFilterKey`, the expense date by default. */
    getFilterQuery: (item: GroupedItem, dateFilterKey?: SearchDateFilterKeys) => string;

    /** Returns the dates a time-based group covers, as yyyy-MM-dd strings */
    getDateRange?: (item: GroupedItem) => ChartBucketRange | undefined;
};

const getMonthRange = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? DateUtils.getMonthDateRange(item.year, item.month) : undefined);

const getYearRange = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? DateUtils.getYearDateRange(item.year) : undefined);

const getQuarterRange = (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? DateUtils.getQuarterDateRange(item.year, item.quarter) : undefined);

function buildDateFilterQuery(range: ChartBucketRange | undefined, dateFilterKey?: SearchDateFilterKeys): string {
    return range ? buildBucketFilterQuery(range, dateFilterKey) : '';
}

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
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.TAG ? item.formattedTagName : undefined),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.TAG ? buildTagFilterQuery(item) : ''),
    },
    [CONST.SEARCH.GROUP_BY.DAY]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.formattedDay : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.shortFormattedDay : undefined),
        getLineChartLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? item.lineChartFormattedDay : undefined),
        axisLabelSteps: [1, 2, 7, 14],
        getFilterQuery: (item: GroupedItem, dateFilterKey?: SearchDateFilterKeys) =>
            item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? buildBucketFilterQuery({start: item.day, end: item.day}, dateFilterKey) : '',
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.DAY ? {start: item.day, end: item.day} : undefined),
    },
    [CONST.SEARCH.GROUP_BY.MONTH]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? (item.formattedMonth ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.MONTH ? item.shortFormattedMonth : undefined),
        axisLabelSteps: [1, 2, 3, 6],
        getFilterQuery: (item: GroupedItem, dateFilterKey?: SearchDateFilterKeys) => buildDateFilterQuery(getMonthRange(item), dateFilterKey),
        getDateRange: getMonthRange,
    },
    [CONST.SEARCH.GROUP_BY.WEEK]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? (item.formattedWeek ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.shortFormattedWeek : undefined),
        getLineChartLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? item.lineChartFormattedWeek : undefined),
        axisLabelSteps: [1, 2, 4],
        getFilterQuery: (item: GroupedItem, dateFilterKey?: SearchDateFilterKeys) => {
            if (item.groupedBy !== CONST.SEARCH.GROUP_BY.WEEK) {
                return '';
            }
            return buildBucketFilterQuery(DateUtils.getWeekDateRange(item.week), dateFilterKey);
        },
        getDateRange: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WEEK ? DateUtils.getWeekDateRange(item.week) : undefined),
    },
    [CONST.SEARCH.GROUP_BY.YEAR]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.YEAR ? (item.formattedYear ?? '') : ''),
        axisLabelSteps: [1, 2, 5],
        getFilterQuery: (item: GroupedItem, dateFilterKey?: SearchDateFilterKeys) => buildDateFilterQuery(getYearRange(item), dateFilterKey),
        getDateRange: getYearRange,
    },
    [CONST.SEARCH.GROUP_BY.QUARTER]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? (item.formattedQuarter ?? '') : ''),
        getShortLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.QUARTER ? item.shortFormattedQuarter : undefined),
        axisLabelSteps: [1, 2, 4],
        getFilterQuery: (item: GroupedItem, dateFilterKey?: SearchDateFilterKeys) => buildDateFilterQuery(getQuarterRange(item), dateFilterKey),
        getDateRange: getQuarterRange,
    },
    [CONST.SEARCH.GROUP_BY.APPROVER]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.APPROVER ? (item.formattedApprover ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.APPROVER ? `${CONST.SEARCH.GROUP_BY.APPROVER}:${item.accountID}` : ''),
    },
    [CONST.SEARCH.GROUP_BY.VIOLATION]: {
        titleIconName: 'Exclamation',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.VIOLATION ? item.formattedViolation : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.VIOLATION ? `${CONST.SEARCH.SYNTAX_FILTER_KEYS.VIOLATION}:${item.violation}` : ''),
    },
    [CONST.SEARCH.GROUP_BY.PAID_BY]: {
        titleIconName: 'Users',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.PAID_BY ? (item.formattedPaidBy ?? '') : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.PAID_BY ? `${CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID_BY}:${item.accountID}` : ''),
    },
    [CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE]: {
        titleIconName: 'Calendar',
        getLabel: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE ? item.formattedWorkflowStage : ''),
        getFilterQuery: (item: GroupedItem) => (item.groupedBy === CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE ? `${CONST.SEARCH.SYNTAX_FILTER_KEYS.WORKFLOW_STAGE}:${item.workflowStage}` : ''),
    },
};

export default CHART_GROUP_BY_CONFIG;
export {buildTagFilterQuery, getTagFilterValue};
export type {ChartBucketRange};
