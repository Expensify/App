import type {SearchGroupBy, SearchView} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {InsightsDashboard, InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {InsightsFilters} from './insightsFilters';

type InsightsQuery = {
    jsonQuery: string;
    queryString: string;
};

type InsightsGraphSpec = {
    graphKey: InsightsGraphKey;
    buildQuery: (filters: InsightsFilters) => string;
};

function buildGraphQuery(filters: InsightsFilters, graphValues: Partial<SearchAdvancedFiltersForm>, options?: {sortBy: string; sortOrder: string; limit?: number}) {
    return buildQueryStringFromFilterFormValues(
        {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            dateOn: filters.datePreset,
            groupCurrency: filters.groupCurrency,
            ...(filters.policyIDs.length > 0 && {policyID: filters.policyIDs}),
            ...graphValues,
        },
        options,
    );
}

function buildRankedGraphQuery(filters: InsightsFilters, groupBy: SearchGroupBy, view?: SearchView) {
    return buildGraphQuery(filters, {groupBy, view}, {sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, sortOrder: CONST.SEARCH.SORT_ORDER.DESC, limit: CONST.SEARCH.TOP_SEARCH_LIMIT});
}

const INSIGHTS_DASHBOARD_GRAPHS: Record<InsightsDashboardID, InsightsGraphSpec[]> = {
    [CONST.INSIGHTS.DASHBOARD.SPEND]: [
        {
            graphKey: CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME,
            buildQuery: (filters) => buildGraphQuery(filters, {groupBy: filters.groupBy, view: CONST.SEARCH.VIEW.LINE}),
        },
        {
            graphKey: CONST.INSIGHTS.GRAPH.TOP_CATEGORIES,
            buildQuery: (filters) => buildRankedGraphQuery(filters, CONST.SEARCH.GROUP_BY.CATEGORY, CONST.SEARCH.VIEW.BAR),
        },
        {
            graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
            buildQuery: (filters) => buildRankedGraphQuery(filters, CONST.SEARCH.GROUP_BY.MERCHANT, CONST.SEARCH.VIEW.PIE),
        },
        {
            graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
            buildQuery: (filters) => buildRankedGraphQuery(filters, CONST.SEARCH.GROUP_BY.FROM),
        },
    ],
};

function buildInsightsGraphHashes(dashboard: InsightsDashboardID, filters: InsightsFilters): InsightsDashboard['graphs'] {
    const graphs: NonNullable<InsightsDashboard['graphs']> = {};

    for (const spec of INSIGHTS_DASHBOARD_GRAPHS[dashboard]) {
        const snapshotHash = buildSearchQueryJSON(spec.buildQuery(filters))?.hash;
        if (snapshotHash) {
            graphs[spec.graphKey] = {snapshotHash};
        }
    }

    return graphs;
}

/** Builds one request containing the queries for every dashboard graph. */
function buildInsightsJsonQuery(dashboard: InsightsDashboardID, filters: InsightsFilters): InsightsQuery | undefined {
    const filtersQuery = buildGraphQuery(filters, {groupBy: filters.groupBy});

    const queryString = buildSearchQueryString(buildSearchQueryJSON(filtersQuery));
    const queryJSON = buildSearchQueryJSON(queryString);

    if (!queryJSON) {
        return undefined;
    }

    return {
        jsonQuery: JSON.stringify({
            groupBy: queryJSON.groupBy,
            filters: queryJSON.filters,
            inputQuery: queryString,
            searchKey: CONST.SEARCH.INSIGHTS_SEARCH_KEYS[dashboard],
            insightsHashes: buildInsightsGraphHashes(dashboard, filters),
        }),
        queryString,
    };
}

export default buildInsightsJsonQuery;
