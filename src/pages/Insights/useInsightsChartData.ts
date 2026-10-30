import VictoryTheme from '@components/Charts/VictoryTheme';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem} from '@components/Search/types';

import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsDashboardChart} from './resolveDashboardState';

import resolveComparisonPeriods from './insightsCompare';

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

/** Resolves a chart's rows, and what it is compared against when the page compares. */
function useInsightsChartData(dashboardChart: InsightsDashboardChart, filters: InsightsFilters): InsightsChartData {
    const {queryJSON, snapshot, previousPeriodQueryJSON, previousPeriodSnapshot, averageTotal, isDashboardLoaded} = dashboardChart;
    const theme = useTheme();
    const {isOffline} = useNetwork();

    const sortedData = useGroupedItems(snapshot, queryJSON);
    const current = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});

    const compare = filters.compare;
    const isPreviousPeriod = compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD;
    // Keeps every compared group, so each plotted group finds its own and not only the top ones.
    const comparedSortedData = useGroupedItems(isPreviousPeriod ? previousPeriodSnapshot : undefined, queryJSON && {...queryJSON, limit: undefined});

    if (current.state !== INSIGHTS_CHART_STATE.READY) {
        return current;
    }

    switch (compare) {
        case CONST.SEARCH.COMPARE.AVERAGE: {
            if (!isDashboardLoaded) {
                return {data: current.data, state: isOffline ? INSIGHTS_CHART_STATE.OFFLINE : INSIGHTS_CHART_STATE.LOADING};
            }
            if (averageTotal === undefined) {
                return current;
            }
            return {...current, comparison: {total: averageTotal}};
        }
        case CONST.SEARCH.COMPARE.PREVIOUS_PERIOD: {
            const periods = resolveComparisonPeriods(filters.date);
            if (!periods) {
                return current;
            }

            const compared = resolveInsightsChartData({snapshot: previousPeriodSnapshot, queryJSON: previousPeriodQueryJSON, sortedData: comparedSortedData, isOffline});
            // A compared chart waits for both sets of rows.
            if (BLOCKING_STATES.has(compared.state)) {
                return {data: current.data, state: compared.state};
            }

            const color = VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.default, theme.colorScheme);
            return {...current, comparison: {data: compared.data, color, periods}};
        }
        default:
            return current;
    }
}

export default useInsightsChartData;
