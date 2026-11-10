/** Builds the GetInsightsDetails request for a clicked chart item, along with the period the panel summarizes. */
import type {ChartPeriod} from '@components/Search/comparisonBuckets';
import type {SearchGroupBy} from '@components/Search/types';

import DateUtils from '@libs/DateUtils';
import {hashText} from '@libs/UserUtils';

import {getDateFilterRange} from '@pages/Insights/insightsCompare';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {buildDashboardQueryJSON} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import type {InsightsGraphKey} from '@src/types/onyx';

import {format, getMonth, getQuarter, getYear, parseISO, startOfWeek} from 'date-fns';

import getInsightsDetailsPeriod from './getInsightsDetailsPeriod';

/** Sections of the panel this request loads */
const INSIGHTS_DETAILS_SECTIONS = ['summary'];

type InsightsDetailsQuery = {
    /** Request payload for GetInsightsDetails */
    jsonQuery: string;

    /** Hash of the graph, filters, period and item, which the response is stored under */
    hash: number;

    /** Days the panel summarizes, trimmed to the Date range */
    period: ChartPeriod;

    /** Length of the summarized period, which the average is counted in */
    periodGroupBy: InsightsTimeGroupBy;

    /** Whether the period hasn't ended yet, so its spend may still grow */
    isPeriodInProgress: boolean;
};

type BuildInsightsDetailsQueryParams = {
    graphKey: InsightsGraphKey;
    filters: InsightsFilters;

    /** What a ranking graph groups by, absent for Spend over time */
    itemGroupBy: SearchGroupBy | undefined;

    /** The member's account ID, the merchant, the category, or the first day of the clicked period */
    itemKey: string;

    /** Last day of the clicked period on Spend over time */
    periodEnd: string | undefined;

    /** Hash of the snapshot the panel's Top expenses are stored under */
    topExpensesSnapshotHash: number;
};

/** Returns the calendar period of the given length that contains the date. */
function getCalendarPeriod(groupBy: InsightsTimeGroupBy, date: string): ChartPeriod {
    const day = parseISO(date);
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.DAY:
            return {start: date, end: date};
        case CONST.SEARCH.GROUP_BY.WEEK:
            // Weeks start on Sunday, matching the week buckets of group-by:week
            return DateUtils.getWeekDateRange(format(startOfWeek(day, {weekStartsOn: 0}), CONST.DATE.FNS_FORMAT_STRING));
        case CONST.SEARCH.GROUP_BY.MONTH:
            return DateUtils.getMonthDateRange(getYear(day), getMonth(day) + 1);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return DateUtils.getQuarterDateRange(getYear(day), getQuarter(day));
        default:
            return DateUtils.getYearDateRange(getYear(day));
    }
}

/** Returns the period the panel summarizes: the clicked one on Spend over time, the last one in the Date range on ranking graphs. */
function getSummarizedPeriod(params: BuildInsightsDetailsQueryParams, periodGroupBy: InsightsTimeGroupBy): ChartPeriod | undefined {
    if (params.graphKey === CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME) {
        return params.periodEnd ? {start: params.itemKey, end: params.periodEnd} : undefined;
    }

    const range = getDateFilterRange(params.filters.date);
    if (!range.end) {
        return undefined;
    }
    const period = getCalendarPeriod(periodGroupBy, range.end);
    return {start: range.start > period.start ? range.start : period.start, end: range.end};
}

/** Builds the request for a Details panel's sections, or nothing when its period can't be resolved. */
function buildInsightsDetailsQuery(params: BuildInsightsDetailsQueryParams): InsightsDetailsQuery | undefined {
    const {graphKey, filters, itemGroupBy, itemKey, topExpensesSnapshotHash} = params;
    const periodGroupBy = getInsightsDetailsPeriod(filters, graphKey);
    const period = getSummarizedPeriod(params, periodGroupBy);
    const filtersQueryJSON = buildDashboardQueryJSON(filters);
    if (!period || !filtersQueryJSON) {
        return undefined;
    }

    const item = itemGroupBy ? {groupBy: itemGroupBy, value: itemGroupBy === CONST.SEARCH.GROUP_BY.FROM ? Number(itemKey) : itemKey} : undefined;
    const identity = {graphKey, filters: filtersQueryJSON.filters, groupBy: periodGroupBy, period, item};
    const hash = hashText(JSON.stringify(identity), 2 ** 32);

    return {
        jsonQuery: JSON.stringify({...identity, sections: INSIGHTS_DETAILS_SECTIONS, topExpensesSnapshotHash, hash}),
        hash,
        period,
        periodGroupBy,
        isPeriodInProgress: period.end >= format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
    };
}

export default buildInsightsDetailsQuery;
export type {InsightsDetailsQuery};
