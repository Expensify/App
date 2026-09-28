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
const QUERY_JSON = buildSearchQueryJSON(QUERY);
const DASHBOARD_WITH_SNAPSHOT: InsightsDashboard = {inputQuery: QUERY, graphs: {[CHART.graphKey]: {snapshotHash: QUERY_JSON?.hash ?? 0}}};
const ERRORS = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');

/** Builds a snapshot a request settled for the chart's query, the way GetInsights and Search both leave it. */
function makeSnapshot(overrides: Partial<SearchResults> = {}): SearchResults {
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
    it('plots the rows once a Search request settled the snapshot', () => {
        // Given no stored dashboard yet, and a snapshot a Search request settled for the chart's query
        const sortedData = makeRows(3);

        // When the chart is resolved against them
        const {data, state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot: makeSnapshot(), queryJSON: QUERY_JSON, sortedData});

        // Then the chart is ready right away instead of waiting on GetInsights for data it already has
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
        expect(data).toBe(sortedData);
    });

    it('waits while nothing is stored for the chart', () => {
        // Given no snapshot under the chart's query yet
        // When the chart is resolved
        const {data, state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot: undefined, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart is still loading rather than empty
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
        expect(data).toEqual([]);
    });

    it('waits while the stored snapshot answers a different query', () => {
        // Given a snapshot whose metadata names another query's hash
        const snapshot = makeSnapshot({search: {...makeSnapshot().search, hash: 1234}});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot, queryJSON: QUERY_JSON, sortedData: makeRows(2)});

        // Then the chart keeps loading instead of plotting rows that belong to another query
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
    });

    it('is empty when a Search request settled without any data', () => {
        // Given a snapshot a Search request marked loaded but wrote no data to
        const snapshot = makeSnapshot({data: undefined});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart is empty, because the request is done and found nothing to plot
        expect(state).toBe(INSIGHTS_CHART_STATE.EMPTY);
    });

    it('is empty when the snapshot arrived with no rows in it', () => {
        // Given a settled snapshot holding data that groups into nothing
        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot: makeSnapshot(), queryJSON: QUERY_JSON, sortedData: []});

        // Then the chart is empty
        expect(state).toBe(INSIGHTS_CHART_STATE.EMPTY);
    });

    it('fails when the snapshot itself carries errors', () => {
        // Given a snapshot that came back with errors
        const snapshot = makeSnapshot({errors: ERRORS});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart shows the failure
        expect(state).toBe(INSIGHTS_CHART_STATE.ERROR);
    });

    it('says it is offline when nothing is stored for it and no data can arrive', () => {
        // Given no snapshot for the chart, while the device is offline
        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot: undefined, queryJSON: QUERY_JSON, sortedData: undefined, isOffline: true});

        // Then it shows the offline state instead of loading forever
        expect(state).toBe(INSIGHTS_CHART_STATE.OFFLINE);
    });

    it('keeps plotting stored rows while offline', () => {
        // Given a settled snapshot with rows, and a connection that since dropped
        const sortedData = makeRows(3);

        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: undefined, snapshot: makeSnapshot(), queryJSON: QUERY_JSON, sortedData, isOffline: true});

        // Then the chart stays on screen rather than being replaced by the offline state
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
    });

    it('waits while the snapshot the dashboard named is not stored yet', () => {
        // Given a record naming a snapshot hash with nothing stored under it yet
        // When the chart is resolved
        const {state} = resolveInsightsChartData({chart: CHART, dashboard: DASHBOARD_WITH_SNAPSHOT, snapshot: undefined, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart is still loading rather than empty, because a named snapshot says data is on its way
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
    });
});
