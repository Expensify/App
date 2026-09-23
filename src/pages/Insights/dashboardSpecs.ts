/** Declares the charts each Insights dashboard renders and how they map to backend graph slots and search views. */

import type {ChartView, SearchGroupBy} from '@components/Search/types';

import {isPolicyEligibleForTopSpenders} from '@libs/SearchUIUtils';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {InsightsDashboardID, InsightsGraphKey, InsightsSearchKey, Policy} from '@src/types/onyx';

type InsightsChartSpec = {
    /** Slot the chart finds its snapshot hash under in the stored dashboard's `graphs` */
    graphKey: InsightsGraphKey;
    titleKey: TranslationPaths;
    view: ChartView;

    /** What the chart aggregates by, left out by charts that follow the page's group-by filter */
    groupBy?: SearchGroupBy;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;

    /** Color every bar is drawn in. Only a bar chart reads it. */
    color?: string;

    /** The chart is shown when any workspace in scope passes this. A chart that declares none is always shown. */
    isPolicyEligible?: (policy: Policy, login: string | undefined) => boolean;
};

type InsightsDashboardSpec = {
    /** Identifies the dashboard to the backend. */
    searchKey: InsightsSearchKey;

    /** Chart across the top of the page, the only one the group-by filter applies to */
    headlineChart: InsightsChartSpec;

    /** Charts in the grid below, grouped the way each of them declares */
    supportingCharts: InsightsChartSpec[];
};

const INSIGHTS_DASHBOARD_SPECS: Record<InsightsDashboardID, InsightsDashboardSpec> = {
    [CONST.INSIGHTS.DASHBOARD.SPEND]: {
        searchKey: CONST.INSIGHTS.SEARCH_KEY.SPEND,
        headlineChart: {
            graphKey: CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME,
            titleKey: 'search.spendOverTime',
            view: CONST.SEARCH.VIEW.LINE,
        },
        supportingCharts: [
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_SPENDERS,
                titleKey: 'search.tabs.topSpenders',
                view: CONST.SEARCH.VIEW.BAR,
                color: colors.blue400,
                groupBy: CONST.SEARCH.GROUP_BY.FROM,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
                isPolicyEligible: isPolicyEligibleForTopSpenders,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_MERCHANTS,
                titleKey: 'search.tabs.topMerchants',
                view: CONST.SEARCH.VIEW.BAR,
                color: colors.pink400,
                groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_TOTAL,
                sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
                limit: CONST.SEARCH.TOP_SEARCH_LIMIT,
            },
            {
                graphKey: CONST.INSIGHTS.GRAPH.TOP_CATEGORIES,
                titleKey: 'search.tabs.topCategories',
                view: CONST.SEARCH.VIEW.PIE,
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
