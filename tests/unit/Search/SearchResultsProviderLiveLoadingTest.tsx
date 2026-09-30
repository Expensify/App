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

jest.mock('@hooks/useTodoSearchResults', () => ({
    __esModule: true,
    default: () => ({data: {}, metadata: {count: 0, total: 0, currency: undefined}}),
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
});
