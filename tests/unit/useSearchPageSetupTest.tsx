import {renderHook} from '@testing-library/react-native';

import useSearchPageSetup from '@hooks/useSearchPageSetup';

import {saveLastSearchParams} from '@libs/actions/ReportNavigation';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

import type * as ReactNavigation from '@react-navigation/native';

const mockClearSelectedTransactions = jest.fn<void, [number | boolean | undefined, boolean | undefined]>();
const mockOpenSearch = jest.fn<void, [unknown, number | undefined]>();
const mockSearch = jest.fn<void, unknown[]>();
const mockMarkPageRequestedSearch = jest.fn<void, unknown[]>();
const mockClearPageRequestedSearch = jest.fn<void, []>();
let mockSearchResults: SearchResults | undefined;
let mockIsOffline = false;
let mockLastFocusCallback: (() => void) | undefined;
// Held so a test can blur the page, not only focus it.
let mockFocusCleanups: Array<() => void> = [];
// Mutable so a test can move a real effect dependency and force the effect to run again.
let mockSearchKey: SearchKey | undefined;
// Mutable so a test can open a tab that was preloaded at idle.
let mockIsInPreloadedTab = false;
// The query the shared search context describes; it can lag the page's own query for a render after a preloaded tab opens.
let mockCurrentSearchHash: number | undefined;
let mockShouldUseLiveData = false;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // Mirrors the real hook: the callback runs on focus and again whenever its identity changes.
        useFocusEffect: (callback: () => void | (() => void)) => {
            if (callback === mockLastFocusCallback) {
                return;
            }
            mockLastFocusCallback = callback;
            const cleanup = callback();
            if (typeof cleanup === 'function') {
                mockFocusCleanups.push(cleanup);
            }
        },
    };
});

jest.mock('@libs/actions/Search', () => ({
    search: (...args: unknown[]) => mockSearch(...args),
    openSearch: (...args: [unknown, number | undefined]) => mockOpenSearch(...args),
    markPageRequestedSearch: (...args: unknown[]) => mockMarkPageRequestedSearch(...args),
    clearPageRequestedSearch: () => mockClearPageRequestedSearch(),
}));

jest.mock('@libs/actions/ReportNavigation', () => ({
    saveLastSearchParams: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@hooks/useIsInPreloadedTab', () => () => mockIsInPreloadedTab);

jest.mock('@hooks/useSearchShouldCalculateTotals', () => () => false);

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({shouldUseLiveData: mockShouldUseLiveData, currentSearchResults: mockSearchResults}),
    useSearchQueryContext: () => ({currentSearchKey: mockSearchKey, currentSearchHash: mockCurrentSearchHash}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: mockClearSelectedTransactions}),
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

/**
 * Cached data with a request still in flight, as a reload during one leaves behind. With data simply
 * loaded the effect returns earlier and never reaches the token guard.
 */
function buildLoadedButPendingSnapshot(hash: number): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return {
        search: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            hash,
            isLoading: true,
            offset: 0,
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADING,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
        },
        data: {},
    } as unknown as SearchResults;
}

/** Results the page already has on screen, as the idle tab preload leaves behind once its request finished. */
function buildLoadedSnapshot(hash: number): SearchResults {
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
        },
        data: {},
    } as unknown as SearchResults;
}

/** The hashes openSearch() was asked to clear, ignoring the plain calls that only load bank account data. */
function getClearedHashes() {
    return mockOpenSearch.mock.calls.map((call) => call[1]).filter((hash) => hash !== undefined);
}

const mockedSaveLastSearchParams = jest.mocked(saveLastSearchParams);

describe('useSearchPageSetup', () => {
    beforeEach(() => {
        mockedSaveLastSearchParams.mockClear();
        mockClearSelectedTransactions.mockClear();
        mockOpenSearch.mockClear();
        mockSearch.mockClear();
        mockSearchResults = undefined;
        mockSearchKey = undefined;
        mockIsInPreloadedTab = false;
        mockCurrentSearchHash = undefined;
        mockShouldUseLiveData = false;
        mockIsOffline = false;
        mockLastFocusCallback = undefined;
        mockMarkPageRequestedSearch.mockClear();
        mockClearPageRequestedSearch.mockClear();
        mockFocusCleanups = [];
    });

    it('claims the first page only when the page is the one requesting it', () => {
        // Given a query with no snapshot yet, so this page owns the first request
        renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});

        // Then it leaves a token, so the mount behind the skeleton does not repeat the request
        expect(mockMarkPageRequestedSearch).toHaveBeenCalledTimes(1);
        expect(mockMarkPageRequestedSearch).toHaveBeenCalledWith(queryJSON?.hash, false);
    });

    it('does not claim the first page when data is already on screen', () => {
        // Given cached data with a request still in flight, so Search is mounted while the page restarts it
        mockSearchResults = buildLoadedButPendingSnapshot(queryJSON?.hash ?? 0);

        // When the page sets up
        renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});

        // Then it requests the page but leaves no token, which would only silence the next revisit
        expect(mockSearch).toHaveBeenCalledTimes(1);
        expect(mockMarkPageRequestedSearch).not.toHaveBeenCalled();
    });

    it('drops the token when the page loses focus', () => {
        // Given the page set up and claimed its first page
        renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});
        expect(mockClearPageRequestedSearch).not.toHaveBeenCalled();

        // When the user navigates away, which runs the focus effect's cleanup
        for (const cleanup of mockFocusCleanups) {
            cleanup();
        }

        // Then the claim is dropped, so a response landing while away cannot silence the refresh on return
        expect(mockClearPageRequestedSearch).toHaveBeenCalledTimes(1);
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

    it('clears the selection when the search itself changes', () => {
        const {rerender} = renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});
        mockClearSelectedTransactions.mockClear();

        rerender({queryJSON: queryJSONB});

        expect(mockClearSelectedTransactions).toHaveBeenCalledWith(queryJSONB?.hash);
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
    describe('in a tab preloaded at idle', () => {
        it('holds the request and the saved search params until the preloaded tab is opened', () => {
            // Given a preloaded tab with nothing cached for its query, which no other test has saved yet
            const uncachedQueryJSON = buildSearchQueryJSON('type:expense status:drafts');
            mockIsInPreloadedTab = true;
            mockCurrentSearchHash = uncachedQueryJSON?.hash;
            const {rerender} = renderHook(() => useSearchPageSetup(uncachedQueryJSON));

            // Then nothing is requested or written while the user has not opened the tab
            expect(mockSearch).not.toHaveBeenCalled();
            expect(mockedSaveLastSearchParams).not.toHaveBeenCalled();

            // When the user opens the tab
            mockIsInPreloadedTab = false;
            rerender({});

            // Then the page requests the query once, as on a normal visit, and records it as a recent search
            expect(mockSearch).toHaveBeenCalledTimes(1);
            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: 0, shouldSaveRecentSearch: true}));
            expect(mockSearch).not.toHaveBeenCalledWith(expect.objectContaining({shouldShowLoading: false}));
            expect(mockedSaveLastSearchParams).toHaveBeenCalledTimes(1);
        });

        it('refreshes the query and records it as a recent search once, when the preloaded tab is first opened', () => {
            // Given a preloaded tab built from cached results, so the page has nothing to request yet
            mockIsInPreloadedTab = true;
            mockSearchResults = buildLoadedSnapshot(queryJSON?.hash ?? 0);
            const {rerender} = renderHook(() => useSearchPageSetup(queryJSON));
            expect(mockSearch).not.toHaveBeenCalled();

            // When the user opens the tab, and the shared search context still describes another query for that first render
            mockIsInPreloadedTab = false;
            rerender({});
            expect(mockSearch).not.toHaveBeenCalled();
            mockCurrentSearchHash = queryJSON?.hash;
            rerender({});

            // Then the page refreshes the query like a normal visit would, once the context has caught up, records the recent search, and keeps the preloaded
            // results on screen instead of flashing a loading state over them
            expect(mockSearch).toHaveBeenCalledTimes(1);
            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: 0, shouldSaveRecentSearch: true, shouldShowLoading: false}));

            // And a later render does not repeat it
            rerender({});
            expect(mockSearch).toHaveBeenCalledTimes(1);
        });

        it('requests a to-do search once when the preloaded tab is first opened', () => {
            // Given a preloaded tab showing a to-do search, which reads live rows and is otherwise requested by Search on mount
            mockIsInPreloadedTab = true;
            mockShouldUseLiveData = true;
            mockCurrentSearchHash = queryJSON?.hash;
            const {rerender} = renderHook(() => useSearchPageSetup(queryJSON));
            expect(mockSearch).not.toHaveBeenCalled();

            // When the user opens the tab
            mockIsInPreloadedTab = false;
            rerender({});
            rerender({});

            // Then its first page is requested once, without saving it as a recent search, like Search does for a to-do on mount
            expect(mockSearch).toHaveBeenCalledTimes(1);
            expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({offset: 0}));
            expect(mockSearch).not.toHaveBeenCalledWith(expect.objectContaining({shouldSaveRecentSearch: true}));
            expect(mockedSaveLastSearchParams).not.toHaveBeenCalled();
        });
    });
});
