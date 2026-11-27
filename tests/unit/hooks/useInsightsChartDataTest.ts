import {renderHook, waitFor} from '@testing-library/react-native';

import {INSIGHTS_CHART_STATE} from '@libs/resolveInsightsChartData';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import type {InsightsFilters} from '@pages/Insights/insightsFilters';
import DEFAULT_INSIGHTS_FILTERS from '@pages/Insights/insightsFilters';
import type {InsightsDashboardChart} from '@pages/Insights/resolveDashboardState';
import useInsightsChartData from '@pages/Insights/useInsightsChartData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SearchResults from '@src/types/onyx/SearchResults';
import type {SearchMonthGroup} from '@src/types/onyx/SearchResults';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const QUERY_JSON = buildSearchQueryJSON('groupBy:month groupCurrency:USD date:year-to-date');
const FILTERS: InsightsFilters = {...DEFAULT_INSIGHTS_FILTERS[CONST.INSIGHTS.DASHBOARD.SPEND], groupCurrency: CONST.CURRENCY.USD, compare: undefined};

/** Builds a snapshot GetInsights settled for the chart's query, holding the given month groups. */
function makeSnapshot(data: SearchResults['data']): SearchResults {
    return {
        search: {
            offset: 0,
            hash: QUERY_JSON?.hash ?? 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
            sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
        },
        data,
    };
}

function renderChartData(snapshot: SearchResults, isAwaitingData: boolean) {
    const dashboardChart: InsightsDashboardChart = {
        chart: INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].headlineChart,
        queryJSON: QUERY_JSON,
        snapshot,
        isDashboardLoaded: true,
        isAwaitingData,
    };
    return renderHook(() => useInsightsChartData(dashboardChart, FILTERS)).result;
}

// Chart rows are only built for a signed-in user
jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({accountID: 1, login: 'chart@test.com'}));

describe('useInsightsChartData', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await waitForBatchedUpdates();
    });

    it('shows the loading state instead of an empty chart while new data is on its way', async () => {
        // Given a settled snapshot with no expenses
        const emptySnapshot = makeSnapshot({});

        // When the chart is waiting for new data, and when it is not
        const awaiting = renderChartData(emptySnapshot, true);
        const settled = renderChartData(emptySnapshot, false);

        // Then only the waiting chart shows its loading state, since the empty result is about to be replaced
        await waitFor(() => expect(settled.current.state).toBe(INSIGHTS_CHART_STATE.EMPTY));
        expect(awaiting.current.state).toBe(INSIGHTS_CHART_STATE.LOADING);
    });

    it('keeps the data a chart already has while new data is on its way', async () => {
        // Given a settled snapshot with expenses in one month
        const monthGroup = createMock<SearchMonthGroup>({year: 2026, month: 1, count: 1, total: 100, currency: CONST.CURRENCY.USD});
        const snapshot = makeSnapshot({[`${CONST.SEARCH.GROUP_PREFIX}2026_1` as const]: monthGroup});

        // When the chart is waiting for new data
        const result = renderChartData(snapshot, true);

        // Then it keeps showing the data it has instead of a skeleton
        await waitFor(() => expect(result.current.state).toBe(INSIGHTS_CHART_STATE.READY));
        expect(result.current.data).toHaveLength(1);
    });
});
