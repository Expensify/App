import {renderHook, waitFor} from '@testing-library/react-native';

import useSearchPageSetup from '@hooks/useSearchPageSetup';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

const mockSearch = jest.fn<void, unknown[]>();
let mockCurrentSearchResults: SearchResults | undefined;
let mockShouldUseLiveData = false;
const mockMarkPageRequestedSearch = jest.fn<void, unknown[]>();
let mockIsSearchTopmostFullScreenRoute = true;
let mockFocusEffects: Array<() => void | (() => void)> = [];
const mockIsFirstPageSearchInFlight = jest.fn<boolean, unknown[]>(() => false);

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: 'expenses'}),
    useSearchResultsContext: () => ({currentSearchResults: mockCurrentSearchResults, shouldUseLiveData: mockShouldUseLiveData}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
    useSearchSelectionContext: () => ({areAllMatchingItemsSelected: false}),
}));

jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/usePrevious', () => () => false);
jest.mock('@hooks/useSearchShouldCalculateTotals', () => () => false);

jest.mock('@libs/actions/ReportNavigation', () => ({
    saveLastSearchParams: jest.fn(),
}));

jest.mock('@libs/actions/Search', () => ({
    openSearch: jest.fn(),
    search: (...args: unknown[]) => mockSearch(...args),
    markPageRequestedSearch: (...args: unknown[]) => mockMarkPageRequestedSearch(...args),
    clearPageRequestedSearch: jest.fn(),
    isFirstPageSearchInFlight: (...args: unknown[]) => mockIsFirstPageSearchInFlight(...args),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => () => mockIsSearchTopmostFullScreenRoute);

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useFocusEffect: (effect: () => void | (() => void)) => {
        mockFocusEffects.push(effect);
    },
}));

/** Runs the cleanups of the latest render's focus effects, like React Navigation does when the screen loses focus. */
function blurScreen() {
    for (const effect of mockFocusEffects) {
        effect()?.();
    }
}

function makeUnresolvedSearchResults(hash: number, isLoading: boolean): SearchResults {
    const searchResults: SearchResults = {
        data: {personalDetailsList: {}},
        search: {
            hash,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            offset: 0,
            hasMoreResults: false,
            hasResults: false,
            isLoading,
            sortBy: 'date',
            sortOrder: 'desc',
        },
    };
    // Remove `data` to represent a snapshot before the response arrives.
    Reflect.set(searchResults, 'data', undefined);
    return searchResults;
}

function makeCachedSearchResults(hash: number, isLoading: boolean, state: SearchResults['search']['state'], offset = 0): SearchResults {
    return {
        data: {personalDetailsList: {}},
        search: {
            hash,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            offset,
            hasMoreResults: false,
            hasResults: false,
            isLoading,
            sortBy: 'date',
            sortOrder: 'desc',
            state,
        },
    };
}

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('type:expense');
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

describe('useSearchPageSetup', () => {
    beforeEach(() => {
        mockSearch.mockClear();
        mockMarkPageRequestedSearch.mockClear();
        mockIsFirstPageSearchInFlight.mockClear();
        mockIsSearchTopmostFullScreenRoute = true;
        mockFocusEffects = [];
        mockShouldUseLiveData = false;
        mockIsFirstPageSearchInFlight.mockReturnValue(false);
    });

    it('retries an unresolved search when temporary search prevention clears', async () => {
        const queryJSON = getQueryJSON();

        const {rerender} = renderHook(
            ({isLoading}) => {
                mockCurrentSearchResults = makeUnresolvedSearchResults(queryJSON.hash, isLoading);
                useSearchPageSetup(queryJSON);
            },
            {initialProps: {isLoading: true}},
        );

        await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(1));

        rerender({isLoading: false});

        await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(2));
    });

    it('retries a cached snapshot whose request state is stranded loading', async () => {
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, CONST.SEARCH.SNAPSHOT_STATE.LOADING);

        renderHook(() => useSearchPageSetup(queryJSON));

        await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(1));
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({isLoading: false}));
    });

    it('does not re-request a shown first page that another caller is already refetching', async () => {
        // Given a page showing a settled snapshot, whose recent search was saved when the user arrived
        const queryJSON = getQueryJSON();
        const {rerender} = renderHook(
            ({state}) => {
                mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, state);
                useSearchPageSetup(queryJSON);
            },
            {initialProps: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED as SearchResults['search']['state']}},
        );
        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();

        // When an auto-refetch of the same first page starts and marks the snapshot pending
        mockIsFirstPageSearchInFlight.mockReturnValue(true);
        rerender({state: CONST.SEARCH.SNAPSHOT_STATE.LOADING});

        // Then the page leaves the running request alone instead of re-firing the same query with the save flag
        await Promise.resolve();
        expect(mockIsFirstPageSearchInFlight).toHaveBeenCalledWith(queryJSON, false, false);
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('keeps skipping the refetch duplicate while an RHP covers the page', async () => {
        // Given a page showing a settled snapshot
        const queryJSON = getQueryJSON();
        const {rerender} = renderHook(
            ({state}) => {
                mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, state);
                useSearchPageSetup(queryJSON);
            },
            {initialProps: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED as SearchResults['search']['state']}},
        );
        await Promise.resolve();

        // When the user opens an expense in the RHP, which blurs the page while Search stays the topmost fullscreen route,
        // and the auto-refetch for the open query starts
        blurScreen();
        mockIsFirstPageSearchInFlight.mockReturnValue(true);
        rerender({state: CONST.SEARCH.SNAPSHOT_STATE.LOADING});

        // Then the page still treats the query as shown and does not send a second request
        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('saves the recent search again after the user left Search and a refresh of the query is running', async () => {
        // Given a page showing a settled snapshot
        const queryJSON = getQueryJSON();
        const {rerender} = renderHook(
            ({state}) => {
                mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, state);
                useSearchPageSetup(queryJSON);
            },
            {initialProps: {state: CONST.SEARCH.SNAPSHOT_STATE.LOADED as SearchResults['search']['state']}},
        );
        await Promise.resolve();

        // When the user leaves Search for another fullscreen page and a refresh of the same query starts
        mockIsSearchTopmostFullScreenRoute = false;
        blurScreen();
        mockIsFirstPageSearchInFlight.mockReturnValue(true);
        rerender({state: CONST.SEARCH.SNAPSHOT_STATE.LOADING});

        // Then the page sends its flagged request, because the next visit has not saved the recent search yet
        await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(1));
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({shouldSaveRecentSearch: true}));
    });

    it('still saves the recent search when the user arrives while another caller refreshes the query', async () => {
        // Given Home is refreshing the query behind one of its rows, so the cached snapshot is already pending
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, CONST.SEARCH.SNAPSHOT_STATE.LOADING);
        mockIsFirstPageSearchInFlight.mockReturnValue(true);

        // When the user opens that query on the Search page
        renderHook(() => useSearchPageSetup(queryJSON));

        // Then the page still sends its flagged request, because this visit has not saved the recent search yet
        await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(1));
        expect(mockSearch).toHaveBeenCalledWith(expect.objectContaining({shouldSaveRecentSearch: true}));
    });

    it('still claims an unloaded first page whose request is already running', async () => {
        // Given the user comes back to a query whose first request has not answered yet
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeUnresolvedSearchResults(queryJSON.hash, false);
        mockIsFirstPageSearchInFlight.mockReturnValue(true);

        // When the page sets up the query again
        renderHook(() => useSearchPageSetup(queryJSON));

        // Then it still claims the page and goes through search(), so Search does not request it a second time on mount
        await waitFor(() => expect(mockSearch).toHaveBeenCalledTimes(1));
        expect(mockMarkPageRequestedSearch).toHaveBeenCalledWith(queryJSON.hash, false);
    });

    it('does not restart the first page while a later page is loading', async () => {
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, true, CONST.SEARCH.SNAPSHOT_STATE.LOADING, CONST.SEARCH.RESULTS_PAGE_SIZE);

        renderHook(() => useSearchPageSetup(queryJSON));

        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not fetch a first page for a live to-do tab with nothing stranded', async () => {
        const queryJSON = getQueryJSON();
        mockShouldUseLiveData = true;
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, CONST.SEARCH.SNAPSHOT_STATE.LOADED);

        renderHook(() => useSearchPageSetup(queryJSON));

        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('never restarts a stranded page on a live to-do tab; paging owns its own requests', async () => {
        const queryJSON = getQueryJSON();
        mockShouldUseLiveData = true;
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, true, CONST.SEARCH.SNAPSHOT_STATE.LOADING, CONST.SEARCH.RESULTS_PAGE_SIZE);

        const {rerender} = renderHook(
            ({isLoading}) => {
                mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, isLoading, CONST.SEARCH.SNAPSHOT_STATE.LOADING, CONST.SEARCH.RESULTS_PAGE_SIZE);
                useSearchPageSetup(queryJSON);
            },
            {initialProps: {isLoading: true}},
        );

        await Promise.resolve();
        rerender({isLoading: false});
        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not retry a cached snapshot whose terminal state is loaded when the legacy isLoading flag is stale', async () => {
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, true, CONST.SEARCH.SNAPSHOT_STATE.LOADED);

        renderHook(() => useSearchPageSetup(queryJSON));

        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('does not retry a cached snapshot that reached a terminal loaded state', async () => {
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, false, CONST.SEARCH.SNAPSHOT_STATE.LOADED);

        renderHook(() => useSearchPageSetup(queryJSON));

        await Promise.resolve();
        expect(mockSearch).not.toHaveBeenCalled();
    });
});
