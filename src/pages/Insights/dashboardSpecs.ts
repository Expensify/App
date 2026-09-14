import type {SearchGroupBy, SearchView} from '@components/Search/types';

import CONST from '@src/CONST';
import type {InsightsDashboardID, InsightsGraphKey} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import DEFAULT_INSIGHTS_FILTERS from './insightsFilters';

type InsightsChartSpec = {
    /** Slot the chart finds its snapshot hashes under in the stored dashboard's `graphs` */
    graphKey: InsightsGraphKey;
    view: SearchView;
    groupBy: SearchGroupBy;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
};

type InsightsDashboardSpec = {
    /** Identifies the dashboard to the backend. */
    searchKey: ValueOf<typeof CONST.SEARCH.INSIGHTS_SEARCH_KEYS>;

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
            groupBy: DEFAULT_INSIGHTS_FILTERS.groupBy,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
                view: CONST.SEARCH.VIEW.PIE,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
                view: CONST.SEARCH.VIEW.PIE,
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_CATEGORIES,
                view: CONST.SEARCH.VIEW.BAR,
                groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
        ],
    },
};

export type {InsightsChartSpec};
export default INSIGHTS_DASHBOARD_SPECS;
