import type {GroupedItem, SearchQueryJSON} from '@components/Search/types';

import {isSearchDataLoaded} from '@libs/SearchUIUtils';

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
    OFFLINE: 'offline',
} as const;

type InsightsChartState = ValueOf<typeof INSIGHTS_CHART_STATE>;

type ResolveInsightsChartDataParams = {
    /** The chart to resolve, as its dashboard declares it */
    chart: InsightsChartSpec;

    /** The dashboard's stored record, which says what was asked for and what came back */
    dashboard: OnyxEntry<InsightsDashboard>;

    /** The snapshot stored under the chart's own query, which GetInsights or Search can fill */
    snapshot: OnyxEntry<SearchResults>;

    /** The chart's own query, which says whether the snapshot answers it */
    queryJSON?: Readonly<SearchQueryJSON>;

    /** The snapshot's rows, grouped and sorted the way the chart plots them */
    sortedData: GroupedItem[] | undefined;

    /** Whether the device is offline, so a chart with nothing stored can't expect data to arrive */
    isOffline?: boolean;
};

type InsightsChartData = {
    /** Rows for the period on screen, empty in every state but `ready` */
    data: GroupedItem[];

    state: InsightsChartState;
};

/** Resolves one chart's rows and state from its snapshot, which a Search request may have loaded before the dashboard's response lands. */
function resolveInsightsChartData({chart, dashboard, snapshot, queryJSON, sortedData, isOffline = false}: ResolveInsightsChartDataParams): InsightsChartData {
    if (Object.keys(snapshot?.errors ?? {}).length > 0) {
        return {data: [], state: INSIGHTS_CHART_STATE.ERROR};
    }

    const isNamedByDashboard = !!dashboard?.graphs?.[chart.graphKey]?.snapshotHash;
    const isLoaded = (isNamedByDashboard && !!snapshot?.data) || isSearchDataLoaded(snapshot, queryJSON);

    if (!isLoaded && isOffline) {
        return {data: [], state: INSIGHTS_CHART_STATE.OFFLINE};
    }

    if (!isLoaded) {
        return {data: [], state: dashboard?.inputQuery && !isNamedByDashboard ? INSIGHTS_CHART_STATE.EMPTY : INSIGHTS_CHART_STATE.LOADING};
    }

    if (!sortedData?.length) {
        return {data: [], state: INSIGHTS_CHART_STATE.EMPTY};
    }

    return {data: sortedData, state: INSIGHTS_CHART_STATE.READY};
}

export {INSIGHTS_CHART_STATE, resolveInsightsChartData};
export type {InsightsChartData};
