import type {GroupedItem} from '@components/Search/types';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@pages/Insights/resolveChartData';

import CONST from '@src/CONST';
import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

const CHART = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND].headlineChart;
const QUERY = 'groupBy:month groupCurrency:USD date:year-to-date';
const DASHBOARD_WITH_SNAPSHOT: InsightsDashboard = {inputQuery: QUERY, graphs: {[CHART.graphKey]: {snapshotHash: 1234}}};
const ERRORS = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');

function makeSnapshot(overrides: Partial<SearchResults> = {}): SearchResults {
    return {
        search: {
            offset: 0,
            hash: 1234,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_MONTH,
            sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
        },
        data: {},
        ...overrides,
    };
}

function makeRows(count: number): GroupedItem[] {
    return Array.from({length: count}, (_, index) => ({
        keyForList: String(index),
        transactions: [],
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        year: 2026,
        month: index + 1,
        count: 1,
        total: 100,
        currency: CONST.CURRENCY.USD,
        formattedMonth: `Month ${index + 1}`,
        shortFormattedMonth: `M${index + 1}`,
        sortKey: index,
    }));
}

describe('resolveInsightsChartData', () => {
    it('plots the rows once the snapshot the record named holds data', () => {
        // Given a record that answered the query on screen, and the rows read off the snapshot it named
        const sortedData = makeRows(3);

        // When the chart is resolved against them
        const {data, state} = resolveInsightsChartData({chart: CHART, dashboard: DASHBOARD_WITH_SNAPSHOT, snapshot: makeSnapshot(), sortedData});

        // Then the chart is ready and plots those rows
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
        expect(data).toBe(sortedData);
    });

    it('waits while the snapshot the record named holds nothing yet', () => {
        // Given a record naming a snapshot Onyx has not written yet
        // When the chart is resolved
        const {data, state} = resolveInsightsChartData({chart: CHART, dashboard: DASHBOARD_WITH_SNAPSHOT, snapshot: undefined, sortedData: undefined});

        // Then the chart is still loading rather than empty, because a named snapshot says data is on its way
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
        expect(data).toEqual([]);
    });

    it('is loading rather than empty until a response is stored', () => {
        // Given nothing stored for the dashboard yet, so no chart has a snapshot hash
        const dashboard = undefined;

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard, snapshot: undefined, sortedData: undefined});

        // Then it is loading, because only a stored response can tell a chart it has nothing to plot
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
    });

    it('is empty when the response named no snapshot for the chart', () => {
        // Given a record that answered the query without a snapshot for this chart
        const dashboard: InsightsDashboard = {inputQuery: QUERY, graphs: {}};

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard, snapshot: undefined, sortedData: undefined});

        // Then the chart is empty, because the response found nothing to plot
        expect(state).toBe(INSIGHTS_CHART_STATE.EMPTY);
    });

    it('is empty when the snapshot arrived with no rows in it', () => {
        // Given a snapshot holding data that groups into nothing
        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: DASHBOARD_WITH_SNAPSHOT, snapshot: makeSnapshot(), sortedData: []});

        // Then the chart is empty
        expect(state).toBe(INSIGHTS_CHART_STATE.EMPTY);
    });

    it('fails when the snapshot itself carries errors', () => {
        // Given a record that answered the query, whose snapshot came back with errors
        const snapshot = makeSnapshot({errors: ERRORS});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: DASHBOARD_WITH_SNAPSHOT, snapshot, sortedData: undefined});

        // Then the chart shows the failure
        expect(state).toBe(INSIGHTS_CHART_STATE.ERROR);
    });

    it('plots the rows a Search request loaded before the dashboard response landed', () => {
        // Given no stored dashboard yet, and a snapshot a Search request settled for the chart's own query
        const queryJSON = buildSearchQueryJSON(QUERY);
        const snapshot = makeSnapshot({search: {...makeSnapshot().search, hash: queryJSON?.hash ?? 0, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED}});
        const sortedData = makeRows(2);

        // When the chart is resolved
        const {data, state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot, queryJSON, sortedData});

        // Then the chart is ready right away instead of waiting on GetInsights for data it already has
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
        expect(data).toBe(sortedData);
    });

    it('says it is offline when nothing is stored for it and no data can arrive', () => {
        // Given no stored dashboard and no snapshot for the chart, while the device is offline
        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot: undefined, sortedData: undefined, isOffline: true});

        // Then it shows the offline state instead of loading forever
        expect(state).toBe(INSIGHTS_CHART_STATE.OFFLINE);
    });

    it('keeps plotting stored rows while offline', () => {
        // Given a snapshot the dashboard already answered with rows, and a connection that since dropped
        const sortedData = makeRows(3);

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: DASHBOARD_WITH_SNAPSHOT, snapshot: makeSnapshot(), sortedData, isOffline: true});

        // Then the chart stays on screen rather than being replaced by the offline state
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
    });
});
