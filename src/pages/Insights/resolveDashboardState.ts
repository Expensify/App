import {isGroupEntry} from '@libs/SearchUIUtils';

import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

const INSIGHTS_DASHBOARD_STATE = {
    READY: 'ready',
    LOADING: 'loading',
    ERROR: 'error',
    OFFLINE: 'offline',
    EMPTY: 'empty',
    NO_EXPENSES: 'noExpenses',
} as const;

type InsightsDashboardState = ValueOf<typeof INSIGHTS_DASHBOARD_STATE>;

/** Resolves the page's state from the record stored for the query on screen, which the key it is read under already scopes. */
function getDashboardState(dashboard: OnyxEntry<InsightsDashboard>, isOffline: boolean, headlineSnapshot: OnyxEntry<SearchResults>): InsightsDashboardState {
    // Only a response sets `inputQuery`, so until one lands the record holds nothing to draw.
    const isDataLoaded = !!dashboard?.inputQuery;

    if (isOffline && !isDataLoaded) {
        return INSIGHTS_DASHBOARD_STATE.OFFLINE;
    }
    if (!isOffline && Object.keys(dashboard?.errors ?? {}).length > 0) {
        return INSIGHTS_DASHBOARD_STATE.ERROR;
    }
    if (!isDataLoaded) {
        return INSIGHTS_DASHBOARD_STATE.LOADING;
    }
    if (dashboard?.hasResults === false) {
        return INSIGHTS_DASHBOARD_STATE.NO_EXPENSES;
    }
    if (headlineSnapshot?.data && !Object.keys(headlineSnapshot.data).some(isGroupEntry)) {
        return INSIGHTS_DASHBOARD_STATE.EMPTY;
    }
    return INSIGHTS_DASHBOARD_STATE.READY;
}

export {INSIGHTS_DASHBOARD_STATE, getDashboardState};
export type {InsightsDashboardState};
