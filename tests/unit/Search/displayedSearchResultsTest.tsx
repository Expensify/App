import {act, renderHook} from '@testing-library/react-native';

import {useSearchResultsActions, useSearchResultsContext} from '@components/Search/SearchContext';
import SearchResultsProvider from '@components/Search/SearchResultsProvider';
import type {SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';

import React from 'react';

// The provider reads the snapshot straight from react-native-onyx (it is the source `@hooks/useOnyx` later
// routes consumers onto), so drive it through a mutable holder the tests can swap between renders.
let mockOnyxSnapshot: SearchResults | undefined;
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    ...jest.requireActual<Record<string, unknown>>('react-native-onyx'),
    useOnyx: () => [mockOnyxSnapshot],
}));

jest.mock('@hooks/useTodoSearchResults', () => ({
    __esModule: true,
    default: () => undefined,
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- fixture only carries the fields isSearchDataLoaded reads
const mockQueryJSON = {
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    filters: {},
    flatFilters: [],
    hash: 123,
    recentSearchHash: 123,
    inputQuery: 'type:expense',
} as unknown as SearchQueryJSON;

jest.mock('@components/Search/SearchContext', () => {
    const actual = jest.requireActual<Record<string, unknown>>('@components/Search/SearchContext');
    return {
        ...actual,
        useSearchQueryContext: () => ({
            currentSearchHash: 123,
            currentSearchKey: undefined,
            currentSearchQueryJSON: mockQueryJSON,
            suggestedSearches: undefined,
        }),
    };
});

const SEARCH_INFO = {
    offset: 0,
    hash: 123,
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    hasMoreResults: false,
    hasResults: true,
    isLoading: false,
    count: 1,
    total: 2500,
    currency: 'USD',
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- fixture only carries the fields the derivation reads
const SNAPSHOT_WITH_ROWS = {
    search: SEARCH_INFO,
    data: {[`${ONYXKEYS.COLLECTION.TRANSACTION}1`]: {transactionID: '1', reportID: 'report1', amount: -2500}},
} as unknown as SearchResults;

/** A snapshot with search info but no `data` key, as seen mid-request. */
function buildSnapshotWithoutData(searchOverrides: Record<string, unknown> = {}): SearchResults {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- fixture deliberately omits `data`
    return {search: {...SEARCH_INFO, ...searchOverrides}} as unknown as SearchResults;
}

function wrapper({children}: {children: React.ReactNode}) {
    return <SearchResultsProvider>{children}</SearchResultsProvider>;
}

function renderProvider() {
    return renderHook(() => ({results: useSearchResultsContext(), actions: useSearchResultsActions()}), {wrapper});
}

describe('SearchResultsProvider displayedSearchResults', () => {
    beforeEach(() => {
        mockOnyxSnapshot = undefined;
    });

    test('passes the snapshot straight through once it has data', () => {
        // Given a resolved snapshot with rows
        mockOnyxSnapshot = SNAPSHOT_WITH_ROWS;

        // When the provider renders
        const {result} = renderProvider();

        // Then the displayed snapshot is the snapshot itself - no substitution needed
        expect(result.current.results.displayedSearchResults).toBe(SNAPSHOT_WITH_ROWS);
    });

    test('substitutes an empty data object when a search resolves with no results', () => {
        // Given a search that reached the terminal LOADED state but carries no `data` key at all
        mockOnyxSnapshot = buildSnapshotWithoutData({state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, hasResults: false, count: 0, total: 0});

        // When the provider renders
        const {result} = renderProvider();

        // Then `data` is filled in as {} so consumers render the empty state instead of treating it as unloaded
        expect(result.current.results.displayedSearchResults?.data).toEqual({});
    });

    test('holds the previous non-empty snapshot while a sort is in flight', () => {
        // Given a rendered snapshot with rows
        mockOnyxSnapshot = SNAPSHOT_WITH_ROWS;
        const {result, rerender} = renderProvider();
        expect(result.current.results.displayedSearchResults).toBe(SNAPSHOT_WITH_ROWS);

        // When a sort starts and the new snapshot arrives still loading, with its `data` not yet populated
        act(() => {
            result.current.actions.setIsSorting(true);
        });
        mockOnyxSnapshot = buildSnapshotWithoutData({isLoading: true});
        rerender({});

        // Then the previous rows stay on screen rather than the table (and the Edit columns picker) briefly
        // seeing no data and falling back to defaults
        expect(result.current.results.displayedSearchResults).toBe(SNAPSHOT_WITH_ROWS);
    });
});
