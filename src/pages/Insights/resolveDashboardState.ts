import type {ChartAverage} from '@components/Search/buildChartSeries';

import {hasGroupWithExpenses} from '@libs/resolveInsightsChartData';
import {isGroupEntry, isSearchDataLoaded} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {InsightsChartStage} from './dashboardSpecs';
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
    average?: ChartAverage;
    isDashboardLoaded?: boolean;
    eligiblePolicyIDs?: string[];

    /** The chart's stages some workspace in scope is eligible for, set when the chart declares stages */
    stages?: InsightsChartStage[];
};

/** Checks whether GetInsights has responded for the dashboard's filters, since only its response sets `inputQuery`. */
function hasDashboardResponse(dashboard: OnyxEntry<InsightsDashboard>): boolean {
    return !!dashboard?.inputQuery;
}

/** Resolves the page's state from the dashboard record and the snapshot of every chart on screen. */
function getDashboardState(
    dashboard: OnyxEntry<InsightsDashboard>,
    isOffline: boolean,
    charts: InsightsDashboardChart[],
    shouldUpsell: boolean,
    hasLoadedBefore = false,
): InsightsDashboardState {
    // Upsell wins over every other state because it is derived from policies already in Onyx, so the user never waits on GetInsights or sees the offline blocker.
    if (shouldUpsell) {
        return INSIGHTS_DASHBOARD_STATE.UPSELL;
    }

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
    const hasChartWithRows = chartStates.some(({hasRows}) => hasRows);
    // The other violation stage may still have data, so the charts and their stage controls stay on screen to switch back
    const hasViolationStageControl = charts.some(({chart}) => chart.hasViolationStageControl);

    if (isOffline && !hasLoadedChart && dashboard?.hasResults !== false) {
        return hasViolationStageControl ? INSIGHTS_DASHBOARD_STATE.READY : INSIGHTS_DASHBOARD_STATE.OFFLINE;
    }
    if (!isOffline && Object.keys(dashboard?.errors ?? {}).length > 0) {
        return dashboard?.responseJsonCode === CONST.JSON_CODE.NO_RESPONSE ? INSIGHTS_DASHBOARD_STATE.STALE : INSIGHTS_DASHBOARD_STATE.ERROR;
    }
    // On the first load, waits for GetInsights, whose response may replace the charts with the no-expenses state
    if (!hasDashboardResponse(dashboard) && !hasChartWithRows && !hasLoadedBefore && !(isOffline && hasLoadedChart)) {
        return INSIGHTS_DASHBOARD_STATE.LOADING;
    }
    if (hasChartWithRows) {
        return INSIGHTS_DASHBOARD_STATE.READY;
    }
    if (dashboard?.hasResults === false) {
        return INSIGHTS_DASHBOARD_STATE.NO_EXPENSES;
    }
    if (chartStates.every(({isLoaded}) => isLoaded)) {
        return hasViolationStageControl ? INSIGHTS_DASHBOARD_STATE.READY : INSIGHTS_DASHBOARD_STATE.EMPTY;
    }
    return INSIGHTS_DASHBOARD_STATE.READY;
}

export {INSIGHTS_DASHBOARD_STATE, getDashboardState, hasDashboardResponse};
export type {InsightsDashboardState, InsightsDashboardChart};
