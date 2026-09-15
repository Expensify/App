import type {SearchGroupBy, SearchQueryString} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';

/** Builds the page's filters in the shape a search query is built from. Leaves the workspaces out when none are selected, which reports on all of them. */
function buildFilterFormValues(filters: InsightsFilters): Partial<SearchAdvancedFiltersForm> {
    return {
        ...('preset' in filters.date ? {dateOn: filters.date.preset} : {dateAfter: filters.date.after, dateBefore: filters.date.before}),
        groupCurrency: filters.groupCurrency,
        ...(filters.policyIDs.length > 0 && {policyID: filters.policyIDs}),
    };
}

/** Builds a chart's query with the page's filters applied, optionally grouped differently than the chart declares. */
function applyInsightsFilters(chart: InsightsChartSpec, filters: InsightsFilters, groupByOverride?: SearchGroupBy): SearchQueryString {
    return buildQueryStringFromFilterFormValues(
        {...buildFilterFormValues(filters), groupBy: groupByOverride ?? chart.groupBy, view: chart.view},
        {sortBy: chart.sortBy, sortOrder: chart.sortOrder, limit: chart.limit},
    );
}

/** Returns the chart's graph slot paired with its snapshot hash, or nothing when its query cannot be hashed. */
function buildSnapshotHashEntries(chart: InsightsChartSpec, filters: InsightsFilters, groupByOverride?: SearchGroupBy): Array<[InsightsGraphKey, {snapshotHash: number}]> {
    const snapshotHash = buildSearchQueryJSON(applyInsightsFilters(chart, filters, groupByOverride))?.hash;
    return snapshotHash ? [[chart.graphKey, {snapshotHash}]] : [];
}

type InsightsQuery = {
    /** Request payload for GetInsights. */
    jsonQuery: string;

    /** The same query the payload carries, kept apart so the dashboard can store what it asked for. */
    inputQuery: SearchQueryString;
};

/** Builds one request for the whole dashboard: the shared filters query plus the snapshot hash each graph's data is stored under. */
function buildInsightsJsonQuery(dashboard: InsightsDashboardID, filters: InsightsFilters): InsightsQuery | undefined {
    const inputQuery = buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters), groupBy: filters.groupBy});
    const queryJSON = buildSearchQueryJSON(inputQuery);
    if (!queryJSON) {
        return undefined;
    }

    const {searchKey, headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[dashboard];
    const insightsHashes: InsightsDashboard['graphs'] = Object.fromEntries([
        ...buildSnapshotHashEntries(headlineChart, filters, filters.groupBy),
        ...supportingCharts.flatMap((chart) => buildSnapshotHashEntries(chart, filters)),
    ]);

    return {
        jsonQuery: JSON.stringify({
            groupBy: queryJSON.groupBy,
            filters: queryJSON.filters,
            inputQuery,
            searchKey,
            insightsHashes,
        }),
        inputQuery,
    };
}

export {applyInsightsFilters};
export default buildInsightsJsonQuery;
