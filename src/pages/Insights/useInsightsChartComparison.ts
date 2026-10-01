import VictoryTheme from '@components/Charts/VictoryTheme';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import resolveComparisonWindows from './insightsCompare';
import {applyInsightsFilters} from './insightsQueries';

type InsightsChartState = ValueOf<typeof INSIGHTS_CHART_STATE>;

type InsightsChartComparison = {
    /** Second series, absent when not comparing or the previous period isn't ready */
    comparison: ChartComparison | undefined;

    /** Previous period's loading, error or offline state, which the chart shows instead */
    blockingState: InsightsChartState | undefined;
};

const BLOCKING_STATES = new Set<InsightsChartState>([INSIGHTS_CHART_STATE.LOADING, INSIGHTS_CHART_STATE.ERROR, INSIGHTS_CHART_STATE.OFFLINE]);

/** Loads and prepares a chart's previous period when the page compares. */
function useInsightsChartComparison(chart: InsightsChartSpec, filters: InsightsFilters, queryJSON: Readonly<SearchQueryJSON> | undefined): InsightsChartComparison {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();

    const isComparing = isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) && filters.compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD;
    const previousPeriodQueryJSON = isComparing ? buildSearchQueryJSON(applyInsightsFilters(chart, filters, CONST.SEARCH.COMPARE.PREVIOUS_PERIOD)) : undefined;
    const [previousPeriodSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${previousPeriodQueryJSON?.hash}`);
    // Keep all previous-period groups so current top groups can find their matches.
    const sortedData = useGroupedItems(previousPeriodSnapshot, queryJSON && {...queryJSON, limit: undefined});
    const windows = resolveComparisonWindows(filters.date, translate);

    if (!isComparing || !windows) {
        return {comparison: undefined, blockingState: undefined};
    }

    const {data, state} = resolveInsightsChartData({snapshot: previousPeriodSnapshot, queryJSON: previousPeriodQueryJSON, sortedData, isOffline});
    if (BLOCKING_STATES.has(state)) {
        return {comparison: undefined, blockingState: state};
    }

    return {
        // The page's current and previous periods are the chart's primary and comparison series.
        comparison: {
            rows: data,
            primaryPeriod: {...windows.current, color: chart.color ?? VictoryTheme.colors.default},
            comparisonPeriod: {...windows.previous, color: chart.comparisonColor ?? VictoryTheme.colors.defaultDot},
        },
        blockingState: undefined,
    };
}

export default useInsightsChartComparison;
