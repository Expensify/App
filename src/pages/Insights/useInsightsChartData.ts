import VictoryTheme from '@components/Charts/VictoryTheme';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import type {InsightsFilters} from './insightsFilters';
import type {InsightsDashboardChart} from './resolveDashboardState';

type InsightsChartState = ValueOf<typeof INSIGHTS_CHART_STATE>;

type InsightsChartData = {
    /** The chart's own grouped rows */
    data: GroupedItem[];

    /** What the chart shows: its data, or a loading, empty, error or offline state */
    state: InsightsChartState;

    /** Rows the chart is compared against, set once both they and the chart's own rows are ready */
    comparison: ChartComparison | undefined;
};

const BLOCKING_STATES = new Set<InsightsChartState>([INSIGHTS_CHART_STATE.LOADING, INSIGHTS_CHART_STATE.ERROR, INSIGHTS_CHART_STATE.OFFLINE]);

/** Resolves a chart's rows, and the rows it is compared against when the page compares. */
function useInsightsChartData(
    {chart, queryJSON, snapshot, averageQueryJSON, averageSnapshot}: Pick<InsightsDashboardChart, 'chart' | 'queryJSON' | 'snapshot' | 'averageQueryJSON' | 'averageSnapshot'>,
    filters: InsightsFilters,
): InsightsChartData {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();

    const sortedData = useGroupedItems(snapshot, queryJSON);
    const current = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});

    const isComparing = isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) && filters.compare === CONST.SEARCH.COMPARE.AVERAGE && chart.view === CONST.SEARCH.VIEW.LINE;
    const averageSortedData = useGroupedItems(isComparing ? averageSnapshot : undefined, queryJSON);

    if (!isComparing || current.state !== INSIGHTS_CHART_STATE.READY) {
        return {...current, comparison: undefined};
    }

    const average = resolveInsightsChartData({snapshot: averageSnapshot, queryJSON: averageQueryJSON, sortedData: averageSortedData, isOffline});
    // A compared chart waits for both sets of rows.
    if (BLOCKING_STATES.has(average.state)) {
        return {data: current.data, state: average.state, comparison: undefined};
    }

    return {
        ...current,
        comparison: {
            data: average.data,
            label: translate('insightsPage.compare.average'),
            color: VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.default, theme.colorScheme),
        },
    };
}

export default useInsightsChartData;
