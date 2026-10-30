import {hasGroupWithExpenses} from '@libs/resolveInsightsChartData';
import {isGroupEntry, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
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
    STALE: 'stale',
    OFFLINE: 'offline',
    EMPTY: 'empty',
    NO_EXPENSES: 'noExpenses',
    UPSELL: 'upsell',
} as const;

type InsightsDashboardState = ValueOf<typeof INSIGHTS_DASHBOARD_STATE>;

type InsightsDashboardChart = InsightsChartQuery & {
    snapshot: OnyxEntry<SearchResults>;
    previousPeriodSnapshot?: OnyxEntry<SearchResults>;
    averageSnapshot?: OnyxEntry<SearchResults>;
};

/**
 * Resolves the page's state from the dashboard record and the snapshot of every chart on screen.
 *
 * `shouldUpsell` wins over every other state because it is settled from the policies already in Onyx: the dashboard
 * has nothing to show whether or not the request succeeded, so the user never waits on one or lands on an offline blocker.
 */
function getDashboardState(dashboard: OnyxEntry<InsightsDashboard>, isOffline: boolean, charts: InsightsDashboardChart[], shouldUpsell: boolean): InsightsDashboardState {
    if (shouldUpsell) {
        return INSIGHTS_DASHBOARD_STATE.UPSELL;
    }

    // Only a GetInsights response sets `inputQuery`.
    const hasDashboardResponse = !!dashboard?.inputQuery;
    const chartStates = charts.map(({snapshot, queryJSON}) => {
        const isLoaded = isSearchDataLoaded(snapshot, queryJSON) && isEmptyObject(snapshot?.errors);
        const data = snapshot?.data;
        const groups = data
            ? Object.keys(data)
                  .filter(isGroupEntry)
                  .map((key) => data[key])
            : [];
        return {isLoaded, hasRows: isLoaded && hasGroupWithExpenses(groups)};
    });
    const hasLoadedChart = chartStates.some(({isLoaded}) => isLoaded);

    if (isOffline && !hasLoadedChart && dashboard?.hasResults !== false) {
        return INSIGHTS_DASHBOARD_STATE.OFFLINE;
    }
    if (!isOffline && Object.keys(dashboard?.errors ?? {}).length > 0) {
        return dashboard?.responseJsonCode === CONST.JSON_CODE.NO_RESPONSE ? INSIGHTS_DASHBOARD_STATE.STALE : INSIGHTS_DASHBOARD_STATE.ERROR;
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
