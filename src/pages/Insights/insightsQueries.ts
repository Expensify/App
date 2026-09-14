import type {SearchGroupBy, SearchQueryJSON, SearchQueryString} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import INSIGHTS_DASHBOARD_SPECS from './dashboardSpecs';

type InsightsQuery = {
    /** Request payload for GetInsights. */
    jsonQuery: string;

    /** Same query in search syntax, stored in Onyx as the query the dashboard's data was requested for. */
    queryString: string;
};

/** The page's filters in the shape a search query is built from. Workspaces are left out when none are selected, which reports on all of them. */
function buildFilterFormValues(filters: InsightsFilters): Partial<SearchAdvancedFiltersForm> {
    return {
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        dateOn: filters.datePreset,
        groupCurrency: filters.groupCurrency,
        ...(filters.policyIDs.length > 0 && {policyID: filters.policyIDs}),
    };
}

/** Narrows a chart's declared query with the page's filters, optionally replacing the group-by it declared. */
function applyInsightsFilters(queryJSON: Readonly<SearchQueryJSON>, filters: InsightsFilters, groupByOverride?: SearchGroupBy): SearchQueryString {
    return buildQueryStringFromFilterFormValues(
        {...buildFilterFormValues(filters), groupBy: groupByOverride ?? queryJSON.groupBy, view: queryJSON.view},
        {sortBy: queryJSON.sortBy, sortOrder: queryJSON.sortOrder, limit: queryJSON.limit},
    );
}

/** The graph slot and snapshot hash of one chart, or nothing when its query cannot be parsed. */
function buildSnapshotHashEntries(chart: InsightsChartSpec, filters: InsightsFilters, groupByOverride?: SearchGroupBy): Array<[InsightsGraphKey, {snapshotHash: number}]> {
    const declaredQueryJSON = buildSearchQueryJSON(chart.query);
    const snapshotHash = declaredQueryJSON ? buildSearchQueryJSON(applyInsightsFilters(declaredQueryJSON, filters, groupByOverride))?.hash : undefined;

    return snapshotHash ? [[chart.graphKey, {snapshotHash}]] : [];
}

/** Builds one request for the whole dashboard: the shared filters query plus the snapshot hash each graph's data is stored under. */
function buildInsightsJsonQuery(dashboard: InsightsDashboardID, filters: InsightsFilters): InsightsQuery | undefined {
    const filtersQuery = buildQueryStringFromFilterFormValues({...buildFilterFormValues(filters), groupBy: filters.groupBy});

    const queryString = buildSearchQueryString(buildSearchQueryJSON(filtersQuery));
    const queryJSON = buildSearchQueryJSON(queryString);

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
            inputQuery: queryString,
            searchKey,
            insightsHashes,
        }),
        queryString,
    };
}

export {applyInsightsFilters};
export default buildInsightsJsonQuery;
