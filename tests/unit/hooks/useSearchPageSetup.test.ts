import {renderHook, waitFor} from '@testing-library/react-native';

import useSearchPageSetup from '@hooks/useSearchPageSetup';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type {SearchResults} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

const mockSearch = jest.fn<void, unknown[]>();
let mockCurrentSearchResults: SearchResults | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: 'expenses'}),
    useSearchResultsContext: () => ({currentSearchResults: mockCurrentSearchResults, shouldUseLiveData: false}),
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
}));

jest.mock('@libs/deferredLayoutWrite', () => ({
    hasDeferredWrite: jest.fn(() => false),
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof NativeNavigation>('@react-navigation/native'),
    useFocusEffect: jest.fn(),
}));

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

    it('does not restart the first page while a later page is loading', async () => {
        const queryJSON = getQueryJSON();
        mockCurrentSearchResults = makeCachedSearchResults(queryJSON.hash, true, CONST.SEARCH.SNAPSHOT_STATE.LOADING, CONST.SEARCH.RESULTS_PAGE_SIZE);

        renderHook(() => useSearchPageSetup(queryJSON));

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
