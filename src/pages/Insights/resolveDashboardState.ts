import {isGroupEntry} from '@libs/SearchUIUtils';

import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {InsightsChartQuery} from './insightsQueries';

import {getInsightsChartLoadState} from './resolveChartData';

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
    const chartStates = charts.map(({chart, snapshot, queryJSON}) => {
        const {isNamedByDashboard, isLoaded} = getInsightsChartLoadState({chart, dashboard, snapshot, queryJSON});
        return {
            isLoaded,
            isSettled: isLoaded || (hasDashboardResponse && !isNamedByDashboard),
            hasRows: isLoaded && Object.keys(snapshot?.data ?? {}).some(isGroupEntry),
        };
    });
    const hasChartData = chartStates.some(({isLoaded}) => isLoaded);
    const isWaitingForData = !hasDashboardResponse && !hasChartData;

    if (isOffline && isWaitingForData) {
        return INSIGHTS_DASHBOARD_STATE.OFFLINE;
    }
    // A failed refresh leaves the stored charts on screen, so only a page with nothing to show reports the failure.
    if (!isOffline && !hasChartData && Object.keys(dashboard?.errors ?? {}).length > 0) {
        return INSIGHTS_DASHBOARD_STATE.ERROR;
    }
    if (isWaitingForData) {
        return INSIGHTS_DASHBOARD_STATE.LOADING;
    }
    if (dashboard?.hasResults === false) {
        return INSIGHTS_DASHBOARD_STATE.NO_EXPENSES;
    }
    if (chartStates.every(({isSettled}) => isSettled) && !chartStates.some(({hasRows}) => hasRows)) {
        return INSIGHTS_DASHBOARD_STATE.EMPTY;
    }
    return INSIGHTS_DASHBOARD_STATE.READY;
}

export {INSIGHTS_DASHBOARD_STATE, getDashboardState};
export type {InsightsDashboardState, InsightsDashboardChart};
