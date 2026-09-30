import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import INSIGHTS_DASHBOARD_SPECS from '@pages/Insights/dashboardSpecs';
import {getDashboardState, INSIGHTS_DASHBOARD_STATE} from '@pages/Insights/resolveDashboardState';
import type {InsightsDashboardChart} from '@pages/Insights/resolveDashboardState';

import CONST from '@src/CONST';
import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

const {headlineChart: HEADLINE_CHART, supportingCharts: SUPPORTING_CHARTS} = INSIGHTS_DASHBOARD_SPECS[CONST.INSIGHTS.DASHBOARD.SPEND];
const [SUPPORTING_CHART] = SUPPORTING_CHARTS;
const QUERY = 'groupBy:month groupCurrency:USD date:year-to-date';
const QUERY_JSON = buildSearchQueryJSON(QUERY);
const LOADED_DASHBOARD: InsightsDashboard = {inputQuery: QUERY, hasResults: true};
const ERRORS = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');

/** Builds a snapshot a request settled for the chart's query, the way GetInsights and Search both leave it. */
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

const GROUP_KEY = `${CONST.SEARCH.GROUP_PREFIX}1` as const;
const SNAPSHOT_WITH_ROWS = makeSnapshot({[GROUP_KEY]: {count: 1, total: 1000, currency: 'USD', year: 2026, month: 1}});
const SNAPSHOT_WITHOUT_ROWS = makeSnapshot({});
const FAILED_SNAPSHOT: SearchResults = {...makeSnapshot({}), errors: ERRORS};

function makeCharts(headline: SearchResults | undefined, supporting: SearchResults | undefined): InsightsDashboardChart[] {
    return [
        {chart: HEADLINE_CHART, snapshot: headline, queryJSON: QUERY_JSON},
        {chart: SUPPORTING_CHART, snapshot: supporting, queryJSON: QUERY_JSON},
    ];
}

describe('getDashboardState', () => {
    it('says the user is offline while no response has landed', () => {
        // Given no stored response and no connection
        // When the page's state is resolved
        const state = getDashboardState(undefined, true, makeCharts(undefined, undefined));

        // Then the page says it is offline rather than spinning forever
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.OFFLINE);
    });

    it('keeps showing a stored dashboard while offline', () => {
        // Given a response that already landed, and a connection that since dropped
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, true, makeCharts(SNAPSHOT_WITH_ROWS, SNAPSHOT_WITH_ROWS));

        // Then the charts stay on screen instead of being replaced by the offline state
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('draws the charts offline when only a supporting chart has data stored', () => {
        // Given no response and no connection, and a supporting chart whose query a Search request already settled
        // When the page's state is resolved
        const state = getDashboardState(undefined, true, makeCharts(undefined, SNAPSHOT_WITH_ROWS));

        // Then the page shows the stored chart and leaves the rest to say they are offline, instead of hiding everything
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('says the user is offline when the only stored snapshot is a failed Search', () => {
        // Given no stored response and no connection, and a headline snapshot whose Search request failed
        // When the page's state is resolved
        const state = getDashboardState(undefined, true, makeCharts(FAILED_SNAPSHOT, undefined));

        // Then the whole page says it is offline, since a failed request left nothing to draw
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.OFFLINE);
    });

    it("says the user is offline instead of empty when every chart's Search failed", () => {
        // Given no stored response and no connection, and Home having failed a Search for every chart on the page
        // When the page's state is resolved
        const state = getDashboardState(undefined, true, makeCharts(FAILED_SNAPSHOT, FAILED_SNAPSHOT));

        // Then the whole page says it is offline, since failed requests don't mean the filters matched nothing
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.OFFLINE);
    });

    it('says the user is offline when the only stored rows belong to a failed Search', () => {
        // Given no stored response and no connection, and a snapshot that kept its rows when a later Search failed
        // When the page's state is resolved
        const state = getDashboardState(undefined, true, makeCharts({...SNAPSHOT_WITH_ROWS, errors: ERRORS}, undefined));

        // Then the whole page says it is offline, since the charts don't plot rows from a failed request either
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.OFFLINE);
    });

    it('does not read a failed snapshot as an empty one', () => {
        // Given a loaded response, a headline chart whose Search request failed, and an empty supporting snapshot
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, makeCharts(FAILED_SNAPSHOT, SNAPSHOT_WITHOUT_ROWS));

        // Then the charts render and the failed one shows its own error, instead of the page claiming nothing matched
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('reports a failed request', () => {
        // Given a record the request wrote errors to
        // When the page's state is resolved
        const state = getDashboardState({errors: ERRORS}, false, makeCharts(undefined, undefined));

        // Then the page offers the error state
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.ERROR);
    });

    it('waits while the request is in flight', () => {
        // Given a record holding nothing but the cleared errors the request wrote optimistically
        // When the page's state is resolved
        const state = getDashboardState({errors: undefined}, false, makeCharts(undefined, undefined));

        // Then the page is still loading, because only a response sets `inputQuery`
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.LOADING);
    });

    it('says the account has no expenses without waiting on a snapshot', () => {
        // Given a response saying the account has no expenses at all, and no chart snapshots
        // When the page's state is resolved
        const state = getDashboardState({inputQuery: QUERY, hasResults: false}, false, makeCharts(undefined, undefined));

        // Then the page says so straight away, since no set of filters could fill it
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.NO_EXPENSES);
    });

    it('prefers the no-expenses state over the empty one', () => {
        // Given an account with no expenses whose chart snapshots also came back with no rows
        // When the page's state is resolved
        const state = getDashboardState({...LOADED_DASHBOARD, hasResults: false}, false, makeCharts(SNAPSHOT_WITHOUT_ROWS, SNAPSHOT_WITHOUT_ROWS));

        // Then the page says the user has no expenses, not that their filters matched nothing
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.NO_EXPENSES);
    });

    it('draws the charts when rows loaded after a response said the account had no expenses', () => {
        // Given a stored response from before the account's first expense, and a chart snapshot Search has since filled with rows
        // When the page's state is resolved
        const state = getDashboardState({...LOADED_DASHBOARD, hasResults: false}, true, makeCharts(SNAPSHOT_WITH_ROWS, undefined));

        // Then the rows win, since they prove the stored `hasResults` is stale
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('says the filters matched nothing when every chart came back without rows', () => {
        // Given an account with expenses and no grouped rows in any chart's snapshot
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, makeCharts(SNAPSHOT_WITHOUT_ROWS, SNAPSHOT_WITHOUT_ROWS));

        // Then the page points at the filters rather than the account
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.EMPTY);
    });

    it('draws the charts when any of them has rows', () => {
        // Given a headline snapshot with no rows, and a supporting chart that has some
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, makeCharts(SNAPSHOT_WITHOUT_ROWS, SNAPSHOT_WITH_ROWS));

        // Then the dashboard renders, since the page is only empty when no chart has anything to plot
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('does not read a missing snapshot as an empty one', () => {
        // Given a response whose supporting chart snapshot has not arrived yet, and an empty headline snapshot
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, makeCharts(SNAPSHOT_WITHOUT_ROWS, undefined));

        // Then the charts render and show their own loading, instead of the page flashing the empty state
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('treats a record with no `hasResults` as an account that may have expenses', () => {
        // Given a response that says nothing about whether the account has expenses, and chart snapshots with no rows
        // When the page's state is resolved
        const state = getDashboardState({inputQuery: QUERY}, false, makeCharts(SNAPSHOT_WITHOUT_ROWS, SNAPSHOT_WITHOUT_ROWS));

        // Then the page shows the empty state, never claiming an account has no expenses on a guess
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.EMPTY);
    });

    it('draws the charts once rows are in', () => {
        // Given a loaded response and chart snapshots holding grouped rows
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, makeCharts(SNAPSHOT_WITH_ROWS, SNAPSHOT_WITH_ROWS));

        // Then the dashboard renders
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('draws the charts from a headline snapshot a Search request loaded before the response landed', () => {
        // Given no stored response yet, and a headline snapshot a Search request settled for the same query
        // When the page's state is resolved
        const state = getDashboardState(undefined, false, makeCharts(SNAPSHOT_WITH_ROWS, undefined));

        // Then the dashboard renders instead of waiting on GetInsights for data it already has
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });
});
