import VictoryTheme from '@components/Charts/VictoryTheme';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {ChartComparison} from '@components/Search/buildChartSeries';
import useGroupedItems from '@components/Search/hooks/useGroupedItems';
import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@libs/resolveInsightsChartData';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
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

/** What a chart is compared against: the query and snapshot of the compared rows, and what names the compared series */
type ComparedChart = Pick<ChartComparison, 'label' | 'periods'> & {
    queryJSON: Readonly<SearchQueryJSON> | undefined;
    snapshot: OnyxEntry<SearchResults>;
};

const BLOCKING_STATES = new Set<InsightsChartState>([INSIGHTS_CHART_STATE.LOADING, INSIGHTS_CHART_STATE.ERROR, INSIGHTS_CHART_STATE.OFFLINE]);

/** Returns what the chart is compared against for the page's Compare mode, or nothing when it doesn't compare */
function getComparedChart(chart: InsightsDashboardChart, filters: InsightsFilters, translate: LocaleContextProps['translate']): ComparedChart | undefined {
    switch (filters.compare) {
        case CONST.SEARCH.COMPARE.PREVIOUS_PERIOD: {
            const periods = resolveComparisonPeriods(filters.date);
            return periods && {queryJSON: chart.previousPeriodQueryJSON, snapshot: chart.previousPeriodSnapshot, periods};
        }
        case CONST.SEARCH.COMPARE.AVERAGE:
            return {queryJSON: chart.averageQueryJSON, snapshot: chart.averageSnapshot, label: translate('insightsPage.compare.average')};
        default:
            return undefined;
    }
}

/** Resolves a chart's rows, and the rows it is compared against when the page compares. */
function useInsightsChartData(dashboardChart: InsightsDashboardChart, filters: InsightsFilters): InsightsChartData {
    const {queryJSON, snapshot} = dashboardChart;
    const theme = useTheme();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();

    const sortedData = useGroupedItems(snapshot, queryJSON);
    const current = resolveInsightsChartData({snapshot, queryJSON, sortedData, isOffline});

    const comparedChart = isBetaEnabled(CONST.BETAS.INSIGHTS_COMPARE) ? getComparedChart(dashboardChart, filters, translate) : undefined;
    // Keeps every compared group, so each plotted group finds its own and not only the top ones.
    const comparedSortedData = useGroupedItems(comparedChart?.snapshot, queryJSON && {...queryJSON, limit: undefined});

    if (!comparedChart || current.state !== INSIGHTS_CHART_STATE.READY) {
        return {...current, comparison: undefined};
    }

    const compared = resolveInsightsChartData({snapshot: comparedChart.snapshot, queryJSON: comparedChart.queryJSON, sortedData: comparedSortedData, isOffline});
    // A compared chart waits for both sets of rows.
    if (BLOCKING_STATES.has(compared.state)) {
        return {data: current.data, state: compared.state, comparison: undefined};
    }

    const color = VictoryTheme.colors.getComparisonColor(VictoryTheme.colors.default, theme.colorScheme);
    return {
        ...current,
        comparison: {data: compared.data, color, label: comparedChart.label, periods: comparedChart.periods},
    };
}

export default useInsightsChartData;
