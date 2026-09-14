import type {SearchQueryString, SearchView} from '@components/Search/types';

import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';

type InsightsChartSpec = {
    /** Slot the chart finds its snapshot hashes under in the stored dashboard's `graphs` */
    graphKey: InsightsGraphKey;

    /** How the chart is drawn */
    view: SearchView;

    /** What the chart plots. The page's filters are added to it before the data is requested. */
    query: SearchQueryString;
};

type InsightsDashboardSpec = {
    /** Identifies the dashboard to the backend. */
    searchKey: string;

    /** Chart across the top of the page, the only one the group-by filter applies to */
    headlineChart: InsightsChartSpec;

    /** Charts in the grid below, each grouped the way it declares */
    supportingCharts: InsightsChartSpec[];
};

const INSIGHTS_DASHBOARD_SPECS: Record<InsightsDashboardID, InsightsDashboardSpec> = {
    [CONST.INSIGHTS.DASHBOARD.SPEND]: {
        searchKey: CONST.SEARCH.INSIGHTS_SEARCH_KEYS.SPEND,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME,
            view: CONST.SEARCH.VIEW.LINE,
            query: buildQueryStringFromFilterFormValues({type: CONST.SEARCH.DATA_TYPES.EXPENSE, groupBy: DEFAULT_INSIGHTS_FILTERS.groupBy, view: CONST.SEARCH.VIEW.LINE}),
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
                view: CONST.SEARCH.VIEW.PIE,
                query: buildQueryStringFromFilterFormValues(
                    {type: CONST.SEARCH.DATA_TYPES.EXPENSE, groupBy: CONST.SEARCH.GROUP_BY.FROM, view: CONST.SEARCH.VIEW.PIE},
                    {sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, sortOrder: CONST.SEARCH.SORT_ORDER.DESC, limit: CONST.SEARCH.TOP_SEARCH_LIMIT},
                ),
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
                view: CONST.SEARCH.VIEW.PIE,
                query: buildQueryStringFromFilterFormValues(
                    {type: CONST.SEARCH.DATA_TYPES.EXPENSE, groupBy: CONST.SEARCH.GROUP_BY.MERCHANT, view: CONST.SEARCH.VIEW.PIE},
                    {sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, sortOrder: CONST.SEARCH.SORT_ORDER.DESC, limit: CONST.SEARCH.TOP_SEARCH_LIMIT},
                ),
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_CATEGORIES,
                view: CONST.SEARCH.VIEW.BAR,
                query: buildQueryStringFromFilterFormValues(
                    {type: CONST.SEARCH.DATA_TYPES.EXPENSE, groupBy: CONST.SEARCH.GROUP_BY.CATEGORY, view: CONST.SEARCH.VIEW.BAR},
                    {sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL, sortOrder: CONST.SEARCH.SORT_ORDER.DESC, limit: CONST.SEARCH.TOP_SEARCH_LIMIT},
                ),
            },
        ],
    },
};

export type {InsightsChartSpec, InsightsDashboardSpec};
export default INSIGHTS_DASHBOARD_SPECS;
