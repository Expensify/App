import type {GroupedItem} from '@components/Search/types';

import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import {INSIGHTS_CHART_STATE, resolveInsightsChartData} from '@pages/Insights/resolveChartData';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

const QUERY_JSON = buildSearchQueryJSON('groupBy:month groupCurrency:USD date:year-to-date');
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
    it('plots the rows once a request settled the snapshot', () => {
        // Given a snapshot GetInsights or Search settled for the chart's query, and the rows read off it
        const sortedData = makeRows(3);

        // When the chart is resolved against them
        const {data, state} = resolveInsightsChartData({snapshot: makeSnapshot(), queryJSON: QUERY_JSON, sortedData});

        // Then the chart is ready and plots those rows, whichever request loaded them
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
        expect(data).toBe(sortedData);
    });

    it('waits while nothing is stored for the chart', () => {
        // Given no snapshot under the chart's query yet
        // When the chart is resolved
        const {data, state} = resolveInsightsChartData({snapshot: undefined, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart is still loading rather than empty
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
        expect(data).toEqual([]);
    });

    it('waits while the stored snapshot answers a different query', () => {
        // Given a snapshot whose metadata names another query's hash
        const snapshot = makeSnapshot({search: {...makeSnapshot().search, hash: 1234}});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({snapshot, queryJSON: QUERY_JSON, sortedData: makeRows(2)});

        // Then the chart keeps loading instead of plotting rows that belong to another query
        expect(state).toBe(INSIGHTS_CHART_STATE.LOADING);
    });

    it('is empty when the request settled without any data', () => {
        // Given a snapshot the request marked loaded but wrote no data to, as when GetInsights found nothing for the chart
        const snapshot = makeSnapshot({data: undefined});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({snapshot, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart is empty, because the request is done and found nothing to plot
        expect(state).toBe(INSIGHTS_CHART_STATE.EMPTY);
    });

    it('is empty when the snapshot arrived with no rows in it', () => {
        // Given a settled snapshot holding data that groups into nothing
        // When the chart is resolved
        const {state} = resolveInsightsChartData({snapshot: makeSnapshot(), queryJSON: QUERY_JSON, sortedData: []});

        // Then the chart is empty
        expect(state).toBe(INSIGHTS_CHART_STATE.EMPTY);
    });

    it('fails when the snapshot itself carries errors', () => {
        // Given a snapshot that came back with errors
        const snapshot = makeSnapshot({errors: ERRORS});

        // When the chart is resolved
        const {state} = resolveInsightsChartData({snapshot, queryJSON: QUERY_JSON, sortedData: undefined});

        // Then the chart shows the failure
        expect(state).toBe(INSIGHTS_CHART_STATE.ERROR);
    });

    it('says it is offline when nothing is stored for it and no data can arrive', () => {
        // Given no snapshot for the chart, while the device is offline
        // When the chart is resolved
        const {state} = resolveInsightsChartData({snapshot: undefined, queryJSON: QUERY_JSON, sortedData: undefined, isOffline: true});

        // Then it shows the offline state instead of loading forever
        expect(state).toBe(INSIGHTS_CHART_STATE.OFFLINE);
    });

    it('keeps plotting stored rows while offline', () => {
        // Given a settled snapshot with rows, and a connection that since dropped
        const sortedData = makeRows(3);

        // When the chart is resolved
        const {state} = resolveInsightsChartData({snapshot: makeSnapshot(), queryJSON: QUERY_JSON, sortedData, isOffline: true});

        // Then the chart stays on screen rather than being replaced by the offline state
        expect(state).toBe(INSIGHTS_CHART_STATE.READY);
    });
});
