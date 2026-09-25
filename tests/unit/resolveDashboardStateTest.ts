import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import {getDashboardState, INSIGHTS_DASHBOARD_STATE} from '@pages/Insights/resolveDashboardState';

import CONST from '@src/CONST';
import type {InsightsDashboard} from '@src/types/onyx';
import type SearchResults from '@src/types/onyx/SearchResults';

const QUERY = 'groupBy:month groupCurrency:USD date:year-to-date';
const LOADED_DASHBOARD: InsightsDashboard = {inputQuery: QUERY, hasResults: true};
const ERRORS = getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage');

function makeSnapshot(data: SearchResults['data']): SearchResults {
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
        data,
    };
}

const GROUP_KEY = `${CONST.SEARCH.GROUP_PREFIX}1` as const;
const SNAPSHOT_WITH_ROWS = makeSnapshot({[GROUP_KEY]: {count: 1, total: 1000, currency: 'USD', year: 2026, month: 1}});
const SNAPSHOT_WITHOUT_ROWS = makeSnapshot({});

describe('getDashboardState', () => {
    it('says the user is offline while no response has landed', () => {
        // Given no stored response and no connection
        // When the page's state is resolved
        const state = getDashboardState(undefined, true, undefined);

        // Then the page says it is offline rather than spinning forever
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.OFFLINE);
    });

    it('keeps showing a stored dashboard while offline', () => {
        // Given a response that already landed, and a connection that since dropped
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, true, SNAPSHOT_WITH_ROWS);

        // Then the charts stay on screen instead of being replaced by the offline state
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('reports a failed request', () => {
        // Given a record the request wrote errors to
        // When the page's state is resolved
        const state = getDashboardState({errors: ERRORS}, false, undefined);

        // Then the page offers the error state
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.ERROR);
    });

    it('waits while the request is in flight', () => {
        // Given a record holding nothing but the cleared errors the request wrote optimistically
        // When the page's state is resolved
        const state = getDashboardState({errors: undefined}, false, undefined);

        // Then the page is still loading, because only a response sets `inputQuery`
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.LOADING);
    });

    it('says the account has no expenses without waiting on a snapshot', () => {
        // Given a response saying the account has no expenses at all, and no snapshot for the headline chart
        // When the page's state is resolved
        const state = getDashboardState({inputQuery: QUERY, hasResults: false}, false, undefined);

        // Then the page says so straight away, since no set of filters could fill it
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.NO_EXPENSES);
    });

    it('prefers the no-expenses state over the empty one', () => {
        // Given an account with no expenses whose headline snapshot also came back with no rows
        // When the page's state is resolved
        const state = getDashboardState({inputQuery: QUERY, hasResults: false}, false, SNAPSHOT_WITHOUT_ROWS);

        // Then the page says the user has no expenses, not that their filters matched nothing
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.NO_EXPENSES);
    });

    it('says the filters matched nothing when the account does have expenses', () => {
        // Given an account with expenses and a headline snapshot holding no grouped rows
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, SNAPSHOT_WITHOUT_ROWS);

        // Then the page points at the filters rather than the account
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.EMPTY);
    });

    it('does not read a missing snapshot as an empty one', () => {
        // Given a response whose headline snapshot has not arrived yet
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, undefined);

        // Then the charts render and show their own loading, instead of the page flashing the empty state
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('treats a record with no `hasResults` as an account that may have expenses', () => {
        // Given a response that says nothing about whether the account has expenses, and a headline snapshot with no rows
        // When the page's state is resolved
        const state = getDashboardState({inputQuery: QUERY}, false, SNAPSHOT_WITHOUT_ROWS);

        // Then the page shows the empty state, never claiming an account has no expenses on a guess
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.EMPTY);
    });

    it('draws the charts once rows are in', () => {
        // Given a loaded response and a headline snapshot holding grouped rows
        // When the page's state is resolved
        const state = getDashboardState(LOADED_DASHBOARD, false, SNAPSHOT_WITH_ROWS);

        // Then the dashboard renders
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });

    it('draws the charts from a headline snapshot a Search request loaded before the response landed', () => {
        // Given no stored response yet, and a headline snapshot a Search request settled for the same query
        const headlineQueryJSON = buildSearchQueryJSON(QUERY);
        const snapshot: SearchResults = {
            ...SNAPSHOT_WITH_ROWS,
            search: {...SNAPSHOT_WITH_ROWS.search, hash: headlineQueryJSON?.hash ?? 0, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED},
        };

        // When the page's state is resolved
        const state = getDashboardState(undefined, false, snapshot, headlineQueryJSON);

        // Then the dashboard renders instead of waiting on GetInsights for data it already has
        expect(state).toBe(INSIGHTS_DASHBOARD_STATE.READY);
    });
});
