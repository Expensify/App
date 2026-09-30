import {isGroupEntry, isSearchDataLoaded} from '@libs/SearchUIUtils';

import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {InsightsChartQuery} from './insightsQueries';

const INSIGHTS_DASHBOARD_STATE = {
    READY: 'ready',
    LOADING: 'loading',
    ERROR: 'error',
    OFFLINE: 'offline',
    EMPTY: 'empty',
    NO_EXPENSES: 'noExpenses',
} as const;

type InsightsDashboardState = ValueOf<typeof INSIGHTS_DASHBOARD_STATE>;

type InsightsDashboardChart = InsightsChartQuery & {
    snapshot: OnyxEntry<SearchResults>;
};

/** Resolves the page's state from the dashboard record and the snapshot of every chart on screen. */
function getDashboardState(dashboard: OnyxEntry<InsightsDashboard>, isOffline: boolean, charts: InsightsDashboardChart[]): InsightsDashboardState {
    // Only a GetInsights response sets `inputQuery`.
    const hasDashboardResponse = !!dashboard?.inputQuery;
    const chartStates = charts.map(({snapshot, queryJSON}) => {
        const isLoaded = isSearchDataLoaded(snapshot, queryJSON) && isEmptyObject(snapshot?.errors);
        return {isLoaded, hasRows: isLoaded && Object.keys(snapshot?.data ?? {}).some(isGroupEntry)};
    });
    const hasLoadedChart = chartStates.some(({isLoaded}) => isLoaded);

    if (isOffline && !hasLoadedChart) {
        return INSIGHTS_DASHBOARD_STATE.OFFLINE;
    }
    if (!isOffline && Object.keys(dashboard?.errors ?? {}).length > 0) {
        return INSIGHTS_DASHBOARD_STATE.ERROR;
    }
    if (!hasDashboardResponse && !hasLoadedChart) {
        return INSIGHTS_DASHBOARD_STATE.LOADING;
    }
    if (chartStates.some(({hasRows}) => hasRows)) {
        return INSIGHTS_DASHBOARD_STATE.READY;
    }
    if (dashboard?.hasResults === false) {
        return INSIGHTS_DASHBOARD_STATE.NO_EXPENSES;
    }
    if (chartStates.every(({isLoaded}) => isLoaded)) {
        return INSIGHTS_DASHBOARD_STATE.EMPTY;
    }
    return INSIGHTS_DASHBOARD_STATE.READY;
}

export {INSIGHTS_DASHBOARD_STATE, getDashboardState};
export type {InsightsDashboardState, InsightsDashboardChart};
