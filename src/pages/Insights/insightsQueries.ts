import type {SearchQueryString} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, getRangeQueryValue} from '@libs/SearchQueryUtils';

import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';

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
    return buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters), groupBy: filters.groupBy});
}

/** Builds a chart's query with the page's filters applied. */
function applyInsightsFilters(chart: InsightsChartSpec, filters: InsightsFilters): SearchQueryString {
    return buildQueryStringFromFilterFormValues(
        {...buildFilterFormValues(filters), groupBy: chart.groupBy ?? filters.groupBy, view: chart.view},
        {sortBy: chart.sortBy, sortOrder: chart.sortOrder, limit: chart.limit},
    );
}

/** Returns the chart's graph slot paired with its snapshot hash. */
function buildSnapshotHashEntries(chart: InsightsChartSpec, filters: InsightsFilters): Array<[InsightsGraphKey, {snapshotHash: number}]> {
    const snapshotHash = buildSearchQueryJSON(applyInsightsFilters(chart, filters))?.hash;
    return snapshotHash ? [[chart.graphKey, {snapshotHash}]] : [];
}

type InsightsQuery = {
    /** Request payload for GetInsights. */
    jsonQuery: string;

    /** Hash of the dashboard-wide query, which the response is stored under so every set of filters keeps its own dashboard entry. */
    hash: number;

    /** Hashes of the snapshots the graphs are stored under. */
    snapshotHashes: number[];
};

/** Builds one request for the whole dashboard: the shared filters query plus the snapshot hash each graph's data is stored under. */
function buildInsightsJsonQuery(dashboard: InsightsDashboardID, filters: InsightsFilters): InsightsQuery | undefined {
    const inputQuery = buildInsightsQueryString(filters);
    const queryJSON = buildSearchQueryJSON(inputQuery);
    if (!queryJSON) {
        return undefined;
    }

    const {searchKey, headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const graphEntries = [...buildSnapshotHashEntries(headlineChart, filters), ...supportingCharts.flatMap((chart) => buildSnapshotHashEntries(chart, filters))];
    const insightsHashes: InsightsDashboard['graphs'] = Object.fromEntries(graphEntries);

    return {
        jsonQuery: JSON.stringify({
            hash: queryJSON.hash,
            groupBy: queryJSON.groupBy,
            filters: queryJSON.filters,
            inputQuery,
            searchKey,
            insightsHashes,
        }),
        hash: queryJSON.hash,
        snapshotHashes: graphEntries.map(([, {snapshotHash}]) => snapshotHash),
    };
}

export {applyInsightsFilters, buildDateFormValues, buildInsightsQueryString};
export type {InsightsQuery};
export default buildInsightsJsonQuery;
