/** Builds the GetInsightsDetails request for a clicked chart item, along with the period the panel summarizes. */
import type {ChartPeriod} from '@components/Search/comparisonBuckets';
import type {SearchGroupBy} from '@components/Search/types';

import {hashText} from '@libs/UserUtils';

import type {InsightsDetailsSection} from '@pages/Insights/dashboardSpecs';
import getInsightsDateRange from '@pages/Insights/getInsightsDateRange';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';
import {buildDetailsFiltersQueryJSON} from '@pages/Insights/insightsQueries';

import CONST from '@src/CONST';
import type {InsightsBiggestChangesGroupBy, InsightsGraphKey} from '@src/types/onyx';

import getCalendarPeriod from './getCalendarPeriod';
import getInsightsDetailsPeriod from './getInsightsDetailsPeriod';

type InsightsDetailsQuery = {
    /** Request payload for GetInsightsDetails */
    jsonQuery: string;

    /** Hash of the graph, filters, period and item, used as the key of the response */
    hash: number;

    /** Hash of the snapshot the backend fills with the Top expenses */
    topExpensesSnapshotHash: number;

    /** The period the panel summarizes, trimmed to the Date range */
    period: ChartPeriod;

    /** Whether the summarized period is a day, week, month, quarter or year, which is also what the average is counted in */
    periodGroupBy: InsightsTimeGroupBy;

    /** Whether the period hasn't ended yet, so its spend may still grow */
    isPeriodInProgress: boolean;
};

type BuildInsightsDetailsQueryParams = {
    graphKey: InsightsGraphKey;

    /** Sections to request, none for graphs GetInsightsDetails doesn't support */
    sections: InsightsDetailsSection[] | undefined;

    /** What Biggest changes groups by, sent only when the section is requested */
    biggestChangesGroupBy?: InsightsBiggestChangesGroupBy;

    filters: InsightsFilters;

    /** What the ranking graph groups by, undefined for Spend over time */
    itemGroupBy: SearchGroupBy | undefined;

    /** The member's account ID, the merchant, the category, or the first day of the clicked period */
    itemKey: string;

    /** Last day of the clicked period on Spend over time */
    periodEnd: string | undefined;

    /** Hash of the snapshot the backend fills with the Top expenses */
    topExpensesSnapshotHash: number;

    /** Last day the dashboard counts expenses through, as yyyy-MM-dd */
    lastDay: string;
};

/** Returns the period the panel summarizes: the clicked one on Spend over time, the last one in the Date range on ranking graphs. */
function getSummarizedPeriod({
    graphKey,
    filters,
    itemKey,
    periodEnd,
    lastDay,
    periodGroupBy,
}: Pick<BuildInsightsDetailsQueryParams, 'graphKey' | 'filters' | 'itemKey' | 'periodEnd' | 'lastDay'> & {periodGroupBy: InsightsTimeGroupBy}): ChartPeriod | undefined {
    if (graphKey === CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME) {
        return periodEnd ? {start: itemKey, end: periodEnd} : undefined;
    }

    const range = getInsightsDateRange(filters.date, lastDay);
    // Ranges like This year end in the future, but the chart only has buckets up to the last day
    const end = range.end && range.end > lastDay ? lastDay : range.end;
    if (!end || end < range.start) {
        return undefined;
    }
    const period = getCalendarPeriod(periodGroupBy, end);
    if (!period) {
        return undefined;
    }
    return {start: range.start > period.start ? range.start : period.start, end};
}

/** Builds the request for a Details panel's sections, or nothing when the backend doesn't support the graph or the period can't be resolved. */
function buildInsightsDetailsQuery({
    graphKey,
    sections,
    biggestChangesGroupBy,
    filters,
    itemGroupBy,
    itemKey,
    periodEnd,
    topExpensesSnapshotHash,
    lastDay,
}: BuildInsightsDetailsQueryParams): InsightsDetailsQuery | undefined {
    if (!sections?.length) {
        return undefined;
    }
    const periodGroupBy = getInsightsDetailsPeriod(filters, graphKey);
    const period = getSummarizedPeriod({graphKey, filters, itemKey, periodEnd, lastDay, periodGroupBy});
    // Sent as dates rather than the preset, which the server would count from its own today and could reject the period for falling outside it
    const {start, end} = getInsightsDateRange(filters.date, lastDay);
    const datedFilters = 'preset' in filters.date && start && end ? {...filters, date: {from: start, to: end}} : filters;
    const filtersQueryJSON = buildDetailsFiltersQueryJSON(datedFilters);
    if (!period || !filtersQueryJSON) {
        return undefined;
    }

    const item = itemGroupBy ? {groupBy: itemGroupBy, value: itemGroupBy === CONST.SEARCH.GROUP_BY.FROM ? Number(itemKey) : itemKey} : undefined;
    // The sections and the Biggest changes grouping stay out of the hash, so a response for one of them merges into the same panel
    const hashedFields = {graphKey, filters: filtersQueryJSON.filters, targetCurrency: filters.groupCurrency, groupBy: periodGroupBy, period, item};
    const hash = hashText(JSON.stringify(hashedFields), 2 ** 32);

    return {
        jsonQuery: JSON.stringify({
            ...hashedFields,
            sections,
            biggestChangesGroupBy: sections.includes(CONST.INSIGHTS.DETAILS_SECTION.BIGGEST_CHANGES) ? biggestChangesGroupBy : undefined,
            topExpensesSnapshotHash,
            hash,
        }),
        hash,
        topExpensesSnapshotHash,
        period,
        periodGroupBy,
        isPeriodInProgress: period.end >= lastDay,
    };
}

export default buildInsightsDetailsQuery;
export type {InsightsDetailsQuery};
