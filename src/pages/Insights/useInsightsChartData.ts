import VictoryTheme from '@components/Charts/VictoryTheme';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {getAverageDuration} from '@components/Search/chartMetricValue';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsDashboardChart} from './resolveDashboardState';

import resolveComparisonPeriods from './insightsCompare';
import {getTrackedFrom, isBucketTracked} from './insightsTrackedFrom';
import normalizeInsightsSnapshot from './normalizeInsightsSnapshot';

type InsightsChartState = ValueOf<typeof INSIGHTS_CHART_STATE>;

type InsightsChartData = {
    /** The chart's own grouped rows */
    data: GroupedItem[];

    /** What the chart shows: its data, or a loading, empty, error or offline state */
    state: InsightsChartState;

    /** What the chart is compared against, set once both it and the chart's own rows are ready */
    comparison?: ChartComparison;
};

const BLOCKING_STATES = new Set<InsightsChartState>([INSIGHTS_CHART_STATE.LOADING, INSIGHTS_CHART_STATE.ERROR, INSIGHTS_CHART_STATE.OFFLINE]);

/** Returns the mean of the groups' average durations, leaving out groups with no duration */
function getMeanDuration(data: GroupedItem[]): number | undefined {
    const durations = data.flatMap((item) => {
        const duration = getAverageDuration(item);
        return duration === undefined ? [] : [duration];
    });
    return durations.length > 0 ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : undefined;
}

/** Resolves a chart's rows, and what it is compared against when the page compares. */
function useInsightsChartData(dashboardChart: InsightsDashboardChart, filters: InsightsFilters): InsightsChartData {
    const {chart, queryJSON, snapshot, previousPeriodQueryJSON, previousPeriodSnapshot, averageQueryJSON, averageSnapshot, average, isDashboardLoaded} = dashboardChart;
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const sortedData = useGroupedItems(normalizeInsightsSnapshot(snapshot, queryJSON?.groupBy), queryJSON);
    const compare = filters.compare;
    const isPreviousPeriod = compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD;
    const isTagAverage = compare === CONST.SEARCH.COMPARE.AVERAGE && dashboardChart.chart.graphKey === CONST.INSIGHTS.GRAPH.TOP_TAGS;
    let comparedSnapshot = isPreviousPeriod ? previousPeriodSnapshot : undefined;
    if (isTagAverage) {
        comparedSnapshot = averageSnapshot;
    }
    // Keeps every compared group, so each plotted group finds its own and not only the top ones.
    const comparedSortedData = useGroupedItems(normalizeInsightsSnapshot(comparedSnapshot, queryJSON?.groupBy), queryJSON && {...queryJSON, limit: undefined});

    const trackedFrom = getTrackedFrom(snapshot);
    const getDateRange = queryJSON?.groupBy ? CHART_GROUP_BY_CONFIG[queryJSON.groupBy].getDateRange : undefined;
    const keepTrackedBuckets = (items: GroupedItem[]) => (trackedFrom ? items.filter((item) => isBucketTracked(getDateRange?.(item), trackedFrom)) : items);

    const resolvedCurrent = resolveInsightsChartData({snapshot, queryJSON, sortedData, metric: chart.metric, isOffline});
    const trackedData = keepTrackedBuckets(resolvedCurrent.data);
    const current: InsightsChartData =
        resolvedCurrent.state === INSIGHTS_CHART_STATE.READY && trackedData.length === 0 ? {data: [], state: INSIGHTS_CHART_STATE.EMPTY} : {...resolvedCurrent, data: trackedData};

    if (current.state !== INSIGHTS_CHART_STATE.READY) {
        return current;
    }

    switch (compare) {
        case CONST.SEARCH.COMPARE.AVERAGE: {
            if (isTagAverage) {
                const compared = resolveInsightsChartData({snapshot: averageSnapshot, queryJSON: averageQueryJSON, sortedData: comparedSortedData, isOffline});
                if (BLOCKING_STATES.has(compared.state)) {
                    return {data: current.data, state: compared.state};
                }
                const color = VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.default, theme.colorScheme);
                return {...current, comparison: {data: compared.data, color, label: translate('insightsPage.compare.tagAverage')}};
            }
            if (!isDashboardLoaded) {
                return {data: current.data, state: isOffline ? INSIGHTS_CHART_STATE.OFFLINE : INSIGHTS_CHART_STATE.LOADING};
            }
            // The stage chart averages the stages it shows, so the line follows the stages the workspaces in scope have enabled
            const chartAverage = chart.groupBy === CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE ? {[CONST.SEARCH.CHART_METRIC.DURATION]: getMeanDuration(current.data)} : average;
            if (chartAverage?.[chart.metric ?? CONST.SEARCH.CHART_METRIC.AMOUNT] === undefined) {
                return current;
            }
            return {...current, comparison: chartAverage};
        }
        case CONST.SEARCH.COMPARE.PREVIOUS_PERIOD: {
            const periods = resolveComparisonPeriods(filters.date);
            // A compared period that ends before the chart's data starts has nothing to compare against
            if (!periods || (!!trackedFrom && periods.comparison.end < trackedFrom)) {
                return current;
            }

            const compared = resolveInsightsChartData({
                snapshot: previousPeriodSnapshot,
                queryJSON: previousPeriodQueryJSON,
                sortedData: comparedSortedData,
                metric: chart.metric,
                isOffline,
            });
            // A compared chart waits for both sets of rows.
            if (BLOCKING_STATES.has(compared.state)) {
                return {data: current.data, state: compared.state};
            }

            const color = VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.default, theme.colorScheme);
            return {...current, comparison: {data: keepTrackedBuckets(compared.data), color, periods}};
        }
        default:
            return current;
    }
}

export default useInsightsChartData;
