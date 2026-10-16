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

import resolveComparisonPeriods from './insightsCompare';

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
    {chart, queryJSON, snapshot, previousPeriodQueryJSON, previousPeriodSnapshot, averageQueryJSON, averageSnapshot}: InsightsDashboardChart,
    filters: InsightsFilters,
): InsightsChartData {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();

    const sortedData = useGroupedItems(snapshot, queryJSON);
    const current = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});

    const compare = isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) && chart.view === CONST.SEARCH.VIEW.LINE ? filters.compare : undefined;
    const periods = compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD ? resolveComparisonPeriods(filters.date) : undefined;
    const isComparing = compare === CONST.SEARCH.COMPARE.AVERAGE || !!periods;
    const comparedQueryJSON = periods ? previousPeriodQueryJSON : averageQueryJSON;
    const comparedSnapshot = periods ? previousPeriodSnapshot : averageSnapshot;
    const comparedSortedData = useGroupedItems(isComparing ? comparedSnapshot : undefined, queryJSON);

    if (!isComparing || current.state !== INSIGHTS_CHART_STATE.READY) {
        return {...current, comparison: undefined};
    }

    const compared = resolveInsightsChartData({snapshot: comparedSnapshot, queryJSON: comparedQueryJSON, sortedData: comparedSortedData, isOffline});
    // A compared chart waits for both sets of rows.
    if (BLOCKING_STATES.has(compared.state)) {
        return {data: current.data, state: compared.state, comparison: undefined};
    }

    const color = VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.default, theme.colorScheme);
    return {
        ...current,
        comparison: periods ? {data: compared.data, color, periods} : {data: compared.data, color, label: translate('insightsPage.compare.average')},
    };
}

export default useInsightsChartData;
