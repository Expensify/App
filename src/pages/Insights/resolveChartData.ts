import type {GroupedItem} from '@components/Search/types';

import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {InsightsChartSpec} from './dashboardSpecs';

const INSIGHTS_CHART_STATE = {
    LOADING: 'loading',
    READY: 'ready',
    EMPTY: 'empty',
    ERROR: 'error',
} as const;

type InsightsChartState = ValueOf<typeof INSIGHTS_CHART_STATE>;

type ResolveInsightsChartDataParams = {
    /** The chart to resolve, as its dashboard declares it */
    chart: InsightsChartSpec;

    /** The dashboard's stored record, which says what was asked for and what came back */
    dashboard: OnyxEntry<InsightsDashboard>;

    /** The snapshot the record names for this chart */
    snapshot: OnyxEntry<SearchResults>;

    /** The snapshot's rows, grouped and sorted the way the chart plots them */
    sortedData: GroupedItem[] | undefined;

    /** The previous period's rows, grouped the same way, absent when nothing is compared */
    previousPeriodData?: GroupedItem[];
};

type InsightsChartData = {
    /** Rows for the period on screen, empty in every state but `ready` */
    data: GroupedItem[];

    /** Rows for the period before it, absent unless the record named a snapshot for it */
    previousPeriodData?: GroupedItem[];

    state: InsightsChartState;
};

/** Resolves one chart's rows and state from the snapshots the dashboard record named for it. */
function resolveInsightsChartData({chart, dashboard, snapshot, sortedData, previousPeriodData}: ResolveInsightsChartDataParams): InsightsChartData {
    if (Object.keys(snapshot?.errors ?? {}).length > 0) {
        return {data: [], state: INSIGHTS_CHART_STATE.ERROR};
    }

    if (!dashboard?.graphs?.[chart.graphKey]?.snapshotHash) {
        return {data: [], state: dashboard?.inputQuery ? INSIGHTS_CHART_STATE.EMPTY : INSIGHTS_CHART_STATE.LOADING};
    }

    if (!snapshot?.data) {
        return {data: [], state: INSIGHTS_CHART_STATE.LOADING};
    }

    if (!sortedData?.length) {
        return {data: [], state: INSIGHTS_CHART_STATE.EMPTY};
    }

    return {data: sortedData, previousPeriodData, state: INSIGHTS_CHART_STATE.READY};
}

export {INSIGHTS_CHART_STATE, resolveInsightsChartData};
export type {InsightsChartData};
