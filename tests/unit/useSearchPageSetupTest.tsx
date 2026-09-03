import {renderHook} from '@testing-library/react-native';

import useSearchPageSetup from '@hooks/useSearchPageSetup';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

import type * as ReactNavigation from '@react-navigation/native';

const mockOpenSearch = jest.fn<void, [unknown, number | undefined]>();
const mockSearch = jest.fn<void, unknown[]>();
let mockSearchResults: SearchResults | undefined;
let mockIsOffline = false;
let mockLastFocusCallback: (() => void) | undefined;
// Mutable so a test can move a real effect dependency and force the effect to run again.
let mockSearchKey: SearchKey | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // Mirrors the real hook: the callback runs on focus and again whenever its identity changes.
        useFocusEffect: (callback: () => void) => {
            if (callback === mockLastFocusCallback) {
                return;
            }
            mockLastFocusCallback = callback;
            callback();
        },
    };
});

jest.mock('@libs/actions/Search', () => ({
    search: (...args: unknown[]) => mockSearch(...args),
    openSearch: (...args: [unknown, number | undefined]) => mockOpenSearch(...args),
}));

jest.mock('@libs/actions/ReportNavigation', () => ({
    saveLastSearchParams: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => () => false);

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({shouldUseLiveData: false, currentSearchResults: mockSearchResults}),
    useSearchQueryContext: () => ({currentSearchKey: mockSearchKey}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
    useSearchSelectionContext: () => ({areAllMatchingItemsSelected: false}),
}));

const QUERY = 'type:expense sortBy:date sortOrder:desc';
const QUERY_B = 'type:expense sortBy:amount sortOrder:asc';
const queryJSON = buildSearchQueryJSON(QUERY);
const queryJSONB = buildSearchQueryJSON(QUERY_B);

/** A snapshot left behind by a failed request: `errors` present, no data, and no server verdict. */
function buildErroredSnapshot(hash: number): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hash,
            isLoading: false,
            offset: 0,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            responseJsonCode: 0,
        },
        errors: {error: 'Oops... something went wrong'},
    } as unknown as SearchResults;
}

/** The hashes openSearch() was asked to clear, ignoring the plain calls that only load bank account data. */
function getClearedHashes() {
    return mockOpenSearch.mock.calls.map((call) => call[1]).filter((hash) => hash !== undefined);
}

describe('useSearchPageSetup', () => {
    beforeEach(() => {
        mockOpenSearch.mockClear();
        mockSearch.mockClear();
        mockSearchResults = undefined;
        mockSearchKey = undefined;
        mockIsOffline = false;
        mockLastFocusCallback = undefined;
    });

    it('leaves an error produced by this page alone', () => {
        // Given a query with no snapshot yet, so the page requests it itself
        renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});
        expect(mockSearch).toHaveBeenCalledTimes(1);

        // When that request fails and leaves an error behind
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;

        // Then the error stays, because it is the outcome the user asked for and clearing it would race the
        // request's own bookkeeping, which declines a fresh request while the failed one is still being torn down
        expect(getClearedHashes()).toEqual([]);
    });

    it('clears a snapshot left errored by an earlier session', () => {
        // Given an errored snapshot the page inherited rather than produced
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        // When the page opens
        renderHook(() => useSearchPageSetup(queryJSON));

        // Then the error is dropped, because errored and terminal reads as resolved and nothing would request again
        expect(getClearedHashes()).toEqual([queryJSON?.hash]);
    });

    it('does not clear the same hash twice when the failure comes straight back', () => {
        // Given an inherited error that has just been cleared
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        const {rerender} = renderHook(() => useSearchPageSetup(queryJSON));
        mockSearchResults = undefined;
        rerender({});

        // When the request that followed the clear fails and writes the error back
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
        rerender({});

        // Then it is left alone, so the page settles on the error view instead of looping request and failure
        expect(getClearedHashes()).toEqual([queryJSON?.hash]);
    });

    it('does not clear a query the server rejected as malformed', () => {
        // Given a snapshot errored with the server's verdict that the query itself is invalid
        const snapshot = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchResults = {...snapshot, search: {...snapshot.search, responseJsonCode: CONST.JSON_CODE.INVALID_SEARCH_QUERY}};

        // When the page opens
        renderHook(() => useSearchPageSetup(queryJSON));

        // Then nothing is cleared, because re-sending a query the server already rejected cannot succeed
        expect(getClearedHashes()).toEqual([]);
    });

    it('does not clear while offline', () => {
        // Given an errored snapshot and no connection
        mockIsOffline = true;
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        // When the page opens
        renderHook(() => useSearchPageSetup(queryJSON));

        // Then nothing is cleared, because the request that would reload the data cannot run offline
        expect(getClearedHashes()).toEqual([]);
    });

    it('leaves a healthy snapshot alone', () => {
        // Given a snapshot carrying no errors
        const snapshot = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchResults = {...snapshot, errors: undefined};

        // When the page opens
        renderHook(() => useSearchPageSetup(queryJSON));

        // Then nothing is cleared, so a working query never pays for this recovery
        expect(getClearedHashes()).toEqual([]);
    });

    it('does not blame the previous query for the one being opened', () => {
        // Given a snapshot still belonging to the errored query being navigated away from
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        // When a different query opens while the snapshot still lags behind
        renderHook(() => useSearchPageSetup(queryJSONB));

        // Then nothing is cleared, because writing a snapshot for a query that never failed makes the page read it
        // as a real result and render its empty state
        expect(getClearedHashes()).toEqual([]);
    });

    it('tracks the clear per hash', () => {
        // Given an errored query that has already been cleared
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        const {rerender} = renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});

        // When a second, independently errored query opens and the first one is returned to
        mockSearchResults = buildErroredSnapshot(queryJSONB?.hash ?? 0);
        rerender({queryJSON: queryJSONB});
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        rerender({queryJSON});

        // Then each query got exactly one clear, so switching back and forth cannot re-request forever
        expect(getClearedHashes()).toEqual([queryJSON?.hash, queryJSONB?.hash]);
    });
});
