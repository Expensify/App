import {renderHook} from '@testing-library/react-native';

import {SearchResultsContext} from '@components/Search/SearchContextDefinitions';
import SearchResultsProvider from '@components/Search/SearchResultsProvider';

import CONST from '@src/CONST';

import React, {use} from 'react';

const mockUseOnyx = jest.fn();
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    ...jest.requireActual<Record<string, unknown>>('react-native-onyx'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    useOnyx: (...args: unknown[]) => mockUseOnyx(...args),
}));

let mockIsTodoSearch = true;
jest.mock('@libs/SearchUIUtils', () => ({
    isTodoSearch: () => mockIsTodoSearch,
    getTransactionsByReportID: () => ({}),
    getViolationsFromSearchData: () => ({}),
}));

const EMPTY_TODO_METADATA = {count: 0, total: 0, currency: undefined};
let mockTodoMetadata: Record<string, unknown> = EMPTY_TODO_METADATA;
jest.mock('@hooks/useTodoSearchResults', () => ({
    __esModule: true,
    default: () => ({data: {}, metadata: mockTodoMetadata}),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({
        currentSearchHash: 1,
        currentSearchKey: 'approve',
        currentSearchQueryJSON: {recentSearchHash: 1},
        suggestedSearches: {},
    }),
}));

function renderProvider(snapshotSearch: Record<string, unknown>) {
    mockUseOnyx.mockReturnValue([{search: snapshotSearch, data: {}}]);
    // read the context object directly, SearchContext is mocked for useSearchQueryContext
    return renderHook(() => use(SearchResultsContext), {
        wrapper: ({children}: {children: React.ReactNode}) => <SearchResultsProvider>{children}</SearchResultsProvider>,
    });
}

describe('SearchResultsProvider live to-do loading flag', () => {
    beforeEach(() => {
        mockUseOnyx.mockReset();
        mockIsTodoSearch = true;
        mockTodoMetadata = EMPTY_TODO_METADATA;
    });

    it('forces isLoading off for a live to-do search even when the snapshot left it stuck true', () => {
        // a stale true survives a reload and would strand the skeletons
        const {result} = renderProvider({isLoading: true, state: CONST.SEARCH.SNAPSHOT_STATE.LOADING, offset: CONST.SEARCH.RESULTS_PAGE_SIZE, hash: 1});

        expect(result.current.shouldUseLiveData).toBe(true);
        expect(result.current.currentSearchResults?.search.isLoading).toBe(false);
        expect(result.current.currentSearchResults?.search.offset).toBe(CONST.SEARCH.RESULTS_PAGE_SIZE);
    });

    it('still reports live results when the snapshot has none, so the empty state wins over a skeleton', () => {
        const {result} = renderProvider({isLoading: false, offset: 0, hash: 1});

        expect(result.current.currentSearchResults?.search.isLoading).toBe(false);
        expect(result.current.currentSearchResults?.search.hasResults).toBe(false);
        expect(result.current.currentSearchResults?.data).toEqual({});
    });

    it('shows the figures the to-do list worked out, including the report count, over the snapshot', () => {
        // Given the to-do list corrected the server's figures for reports that left it on this device
        mockTodoMetadata = {count: 125, total: 125000, currency: 'USD', reportCount: 119};

        // When the provider builds the live results over a snapshot that still holds the server's old figures
        const {result} = renderProvider({isLoading: false, offset: 0, hash: 1, count: 126, total: 126000, currency: 'USD', reportCount: 120});

        // Then the search shows the corrected figures, which "Select all" and the footer read
        expect(result.current.currentSearchResults?.search).toMatchObject({count: 125, total: 125000, currency: 'USD', reportCount: 119});
    });
});
