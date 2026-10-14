import VictoryTheme from '@components/Charts/VictoryTheme';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {InsightsChartSpec} from './dashboardSpecs';
import type {InsightsFilters} from './insightsFilters';

import resolveComparisonWindows from './insightsCompare';
import {applyInsightsFilters} from './insightsQueries';

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

/**
 * Resolves a chart's rows, and the rows it is compared against when the page compares. Only line charts draw a second series.
 * The compared rows are read with the chart's own query, since they are grouped and sorted the same way.
 */
function useInsightsChartData(chart: InsightsChartSpec, filters: InsightsFilters, queryJSON: Readonly<SearchQueryJSON> | undefined, snapshot: OnyxEntry<SearchResults>): InsightsChartData {
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();

    const sortedData = useGroupedItems(snapshot, queryJSON);
    const current = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});

    const compare = isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) && chart.view === CONST.SEARCH.VIEW.LINE ? filters.compare : undefined;
    const windows = compare === CONST.SEARCH.COMPARE.PREVIOUS_PERIOD ? resolveComparisonWindows(filters.date) : undefined;
    const isComparing = compare === CONST.SEARCH.COMPARE.AVERAGE || !!windows;
    const comparedQueryJSON = isComparing ? buildSearchQueryJSON(applyInsightsFilters(chart, filters, compare)) : undefined;
    const [comparedSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${comparedQueryJSON?.hash}`);
    const comparedSortedData = useGroupedItems(comparedSnapshot, queryJSON);

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
        comparison: windows
            ? {data: compared.data, color, periods: {primary: windows.current, comparison: windows.previous}}
            : {data: compared.data, color, label: translate('insightsPage.compare.average')},
    };
}

export default useInsightsChartData;
