import useOnyx from '@hooks/useOnyx';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchTypeMenuItem} from '@libs/SearchUIUtils';

import type {InsightsChartSpec} from '@pages/Insights/dashboardSpecs';
import INSIGHTS_DASHBOARD_SPECS, {getVisibleCharts} from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import {INSIGHTS_RUNNING_TOTAL_GROUP_BY} from '@pages/Insights/insightsFilters';
import {isRunningTotalAvailable} from '@pages/Insights/insightsGroupByUtils';
import {applyInsightsFilters} from '@pages/Insights/insightsQueries';
import useInsightsFilters from '@pages/Insights/useInsightsFilters';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {InsightsGraphKey} from '@src/types/onyx';

// Home only shows Spend charts, which also exist as Search menu items
type HomeInsightGraphKey = Exclude<InsightsGraphKey, typeof CONST.INSIGHTS.GRAPH.VIOLATIONS_OVER_TIME>;

type HomeInsightChartSpec = InsightsChartSpec & {graphKey: HomeInsightGraphKey};

const HOME_INSIGHT_ICONS: Record<HomeInsightGraphKey, SearchTypeMenuItem['icon']> = {
    [CONST.INSIGHTS.GRAPH.SPEND_OVER_TIME]: 'CalendarSolid',
    [CONST.INSIGHTS.GRAPH.TOP_SPENDERS]: 'User',
    [CONST.INSIGHTS.GRAPH.TOP_MERCHANTS]: 'Basket',
    [CONST.INSIGHTS.GRAPH.TOP_CATEGORIES]: 'Folder',
};

/** Whether the chart is one Home can show. */
function isHomeInsightChart(chart: InsightsChartSpec): chart is HomeInsightChartSpec {
    return chart.graphKey in HOME_INSIGHT_ICONS;
}

/** Builds a Home insight that queries the same chart as the Insights page. */
function buildInsightConfigFromChart(chart: HomeInsightChartSpec, filters: InsightsFilters): SearchTypeMenuItem {
    const searchQuery = applyInsightsFilters(chart, filters);
    const searchQueryJSON = buildSearchQueryJSON(searchQuery);

    return {
        key: chart.graphKey,
        translationPath: chart.titleKey,
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        icon: HOME_INSIGHT_ICONS[chart.graphKey],
        searchQuery,
        searchQueryJSON,
        hash: searchQueryJSON?.hash ?? CONST.DEFAULT_NUMBER_ID,
        similarSearchHash: searchQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID,
        recentSearchHash: searchQueryJSON?.recentSearchHash ?? CONST.DEFAULT_NUMBER_ID,
    };
}

/**
 * Builds the configs for the Home insights the current user should see, in display order.
 * The charts and their visibility match the Insights Spend dashboard.
 */
function useHomeInsightConfigs(): {configs: SearchTypeMenuItem[]; isResolved: boolean; shouldShowRunningTotal: boolean} {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {filters, isResolved: areFiltersResolved} = useInsightsFilters(CONST.INSIGHTS.DASHBOARD.SPEND);

    const {headlineChart, supportingCharts} = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
    const configs = getVisibleCharts([headlineChart, ...supportingCharts], policies, filters.policyIDs, session?.email)
        .filter(isHomeInsightChart)
        .map((chart) => buildInsightConfigFromChart(chart, filters));
    return {configs, isResolved: areFiltersResolved, shouldShowRunningTotal: filters.groupBy === INSIGHTS_RUNNING_TOTAL_GROUP_BY && isRunningTotalAvailable(filters.date)};
}

export default useHomeInsightConfigs;
