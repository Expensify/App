import type {SearchCompareMode, SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, getRangeQueryValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';

/** How many periods before the selected date range the Average mode spans (Typical on the ranking charts) */
const COMPARE_TYPICAL_PERIOD_COUNT = 1;

/** Builds the date filter in the shape a search query is built from. */
function buildDateFormValues(date: InsightsFilters['date']): Partial<SearchAdvancedFiltersForm> {
    if ('preset' in date) {
        return {dateOn: date.preset};
    }
    if ('on' in date) {
        return {dateOn: date.on};
    }
    return {dateRange: getRangeQueryValue(date.from, date.to)};
}

/** Builds the page's filters in the shape a search query is built from. Leaves the workspaces out when none are selected, which reports on all of them. */
function buildFilterFormValues(filters: InsightsFilters): Partial<SearchAdvancedFiltersForm> {
    return {
        ...buildDateFormValues(filters.date),
        groupCurrency: filters.groupCurrency,
        ...(filters.policyIDs.length > 0 && {policyID: filters.policyIDs}),
    };
}

/** Builds the dashboard-wide query the whole page is narrowed by. */
function buildInsightsQueryString(filters: InsightsFilters): SearchQueryString {
    return buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters), groupBy: filters.groupBy, compare: filters.compare});
}

/** Builds a chart's query with the page's filters applied. */
function applyInsightsFilters(chart: InsightsChartSpec, filters: InsightsFilters, compare?: SearchCompareMode): SearchQueryString {
    return buildQueryStringFromFilterFormValues(
        {...buildFilterFormValues(filters), groupBy: chart.groupBy ?? filters.groupBy, view: chart.view, compare},
        {sortBy: chart.sortBy, sortOrder: chart.sortOrder, limit: chart.limit},
    );
}

type InsightsChartQuery = {
    chart: InsightsChartSpec;
    queryJSON: Readonly<SearchQueryJSON> | undefined;
};

type InsightsGraphHashes = {
    snapshotHash: number;
    previousPeriodSnapshotHash?: number;
    averageSnapshotHash?: number;
};
type InsightsGraphHashEntry = [InsightsGraphKey, InsightsGraphHashes];

/** Returns the chart's graph slot paired with the hashes its current period, previous period and average are stored under. */
function buildSnapshotHashEntry({chart, queryJSON}: InsightsChartQuery, filters: InsightsFilters, shouldIncludeComparisons: boolean): InsightsGraphHashEntry | undefined {
    const snapshotHash = queryJSON?.hash;
    if (!snapshotHash) {
        return undefined;
    }
    if (!shouldIncludeComparisons) {
        return [chart.graphKey, {snapshotHash}];
    }

    const previousPeriodSnapshotHash = buildSearchQueryJSON(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.PREVIOUS_PERIOD))?.hash;
    const averageSnapshotHash = buildSearchQueryJSON(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.AVERAGE))?.hash;
    if (!previousPeriodSnapshotHash || !averageSnapshotHash) {
        return undefined;
    }

    return [chart.graphKey, {snapshotHash, previousPeriodSnapshotHash, averageSnapshotHash}];
}

type InsightsQuery = {
    /** Request payload for GetInsights. */
    jsonQuery: string;

    /** Hash of the dashboard-wide query, which the response is stored under so every set of filters keeps its own dashboard entry. Leaves out the comparison, since every response carries all of them. */
    hash: number;

    /** Hashes of the snapshots the graphs are stored under. */
    snapshotHashes: number[];

    headlineChart: InsightsChartQuery;
    supportingCharts: InsightsChartQuery[];
};

/** Builds one request for the whole dashboard, naming each graph's snapshots by its chart's query hashes, and returns those chart queries to read the snapshots back with. */
function buildInsightsJsonQuery(dashboard: InsightsDashboardID, filters: InsightsFilters, shouldIncludeComparisons: boolean): InsightsQuery | undefined {
    const inputQuery = buildInsightsQueryString({...filters, compare: undefined});
    const queryJSON = buildSearchQueryJSON(inputQuery);
    if (!queryJSON) {
        return undefined;
    }

    const spec = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const buildChartQuery = (chart: InsightsChartSpec): InsightsChartQuery => ({chart, queryJSON: buildSearchQueryJSON(applyInsightsFilters(chart, filters))});
    const headlineChart = buildChartQuery(spec.headlineChart);
    const supportingCharts = spec.supportingCharts.map(buildChartQuery);
    const graphEntries = [headlineChart, ...supportingCharts]
        .map((chartQuery) => buildSnapshotHashEntry(chartQuery, filters, shouldIncludeComparisons))
        .filter((entry): entry is InsightsGraphHashEntry => !!entry);
    const insightsHashes: InsightsDashboard['graphs'] = Object.fromEntries(graphEntries);

    return {
        jsonQuery: JSON.stringify({
            hash: queryJSON.hash,
            groupBy: queryJSON.groupBy,
            filters: queryJSON.filters,
            inputQuery,
            searchKey: spec.searchKey,
            insightsHashes,
            numberOfPeriods: shouldIncludeComparisons ? COMPARE_TYPICAL_PERIOD_COUNT : undefined,
        }),
        hash: queryJSON.hash,
        snapshotHashes: graphEntries.flatMap(([, hashes]) => Object.values(hashes).filter((hash): hash is number => hash !== undefined)),
        headlineChart,
        supportingCharts,
    };
}

export {applyInsightsFilters, buildDateFormValues, buildInsightsQueryString};
export type {InsightsChartQuery, InsightsQuery};
export default buildInsightsJsonQuery;
