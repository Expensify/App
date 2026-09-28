import {act, renderHook, waitFor} from '@testing-library/react-native';

import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {clearSearchTagFiltersSearchResults, openSearchTagFiltersPage, setSearchTagFiltersPagination} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const mockOpenSearchTagFiltersPage = jest.mocked(openSearchTagFiltersPage);
const mockSetSearchTagFiltersPagination = jest.mocked(setSearchTagFiltersPagination);
const mockClearSearchTagFiltersSearchResults = jest.mocked(clearSearchTagFiltersSearchResults);

const onyxData: Record<string, unknown> = {};

let mockIsOffline = false;

const mockUseOnyx = jest.fn((key: string) => [onyxData[key]]);
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => mockUseOnyx(key),
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@libs/actions/Search', () => ({
    openSearchTagFiltersPage: jest.fn(() => Promise.resolve({hasMore: false, nextCursor: ''})),
    setSearchTagFiltersPagination: jest.fn(),
    clearSearchTagFiltersSearchResults: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

const POLICY_ID = 'policy-1';

function setPartialTagFilterState(searchQuery: string, policyIDs = POLICY_ID) {
    onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {
        hasMore: true,
        nextCursor: 'cursor-1',
        searchQuery,
        policyIDs,
    };
    onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS] = [{tagName: `${searchQuery}-match`, tagListName: 'TagList'}];
}

function setCompleteTagFilterState(searchQuery: string, policyIDs = POLICY_ID) {
    onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {
        hasMore: false,
        nextCursor: '',
        searchQuery,
        policyIDs,
    };
    onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS] = [
        {tagName: `${searchQuery}-match`, tagListName: 'TagList'},
        {tagName: 'other-tag', tagListName: 'TagList'},
    ];
}

describe('useSearchTagFilters', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockIsOffline = false;
        mockUseOnyx.mockClear();
        mockOpenSearchTagFiltersPage.mockClear().mockResolvedValue({hasMore: false, nextCursor: ''});
        mockSetSearchTagFiltersPagination.mockClear().mockImplementation((hasMore, nextCursor, searchQuery, policyIDs) => {
            onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {hasMore, nextCursor, searchQuery, policyIDs};
        });
        mockClearSearchTagFiltersSearchResults.mockClear().mockImplementation((policyIDs) => {
            onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {hasMore: false, nextCursor: '', searchQuery: '', policyIDs};
            onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS] = [];
        });
    });

    it('fetches with an empty query on mount when pagination still holds a previous search term', async () => {
        setPartialTagFilterState('marketing');

        renderHook(() => useSearchTagFilters(POLICY_ID));

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledWith(
                expect.objectContaining({searchQuery: '', policyIDs: POLICY_ID, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE}),
                true,
            );
        });

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalledWith(expect.objectContaining({searchQuery: 'marketing'}), expect.anything());
    });

    it('preserves cached tags when the filter unmounts so they remain available offline', () => {
        setPartialTagFilterState('');

        const {unmount} = renderHook(() => useSearchTagFilters(POLICY_ID));

        unmount();

        expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS]).toEqual([{tagName: '-match', tagListName: 'TagList'}]);
        expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION]).toEqual(expect.objectContaining({hasMore: true, nextCursor: 'cursor-1', searchQuery: ''}));

        mockIsOffline = true;
        mockOpenSearchTagFiltersPage.mockClear();

        const {result} = renderHook(() => useSearchTagFilters(POLICY_ID));

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(result.current.searchResults).toEqual([{tagName: '-match', tagListName: 'TagList'}]);
    });

    it('re-fetches on remount after leaving the filter so pagination can continue', async () => {
        setPartialTagFilterState('');
        mockOpenSearchTagFiltersPage.mockResolvedValueOnce({hasMore: true, nextCursor: 'cursor-1'});

        const {unmount} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledTimes(1);
        });

        unmount();

        mockOpenSearchTagFiltersPage.mockClear().mockResolvedValueOnce({hasMore: true, nextCursor: 'cursor-2'});

        const {result} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledWith(
                expect.objectContaining({searchQuery: '', policyIDs: POLICY_ID, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE}),
                true,
            );
        });

        await waitFor(() => {
            expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION]).toEqual(expect.objectContaining({hasMore: true, nextCursor: 'cursor-2', searchQuery: ''}));
        });

        mockOpenSearchTagFiltersPage.mockClear().mockResolvedValueOnce({hasMore: false, nextCursor: ''});

        act(() => {
            result.current.loadMore();
        });

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledWith(
                expect.objectContaining({searchQuery: '', policyIDs: POLICY_ID, cursor: 'cursor-2', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE}),
                false,
                [{tagName: '-match', tagListName: 'TagList'}],
            );
        });
    });

    it('clears the page-loading state when a new search supersedes an in-flight page load', async () => {
        setPartialTagFilterState('');
        mockOpenSearchTagFiltersPage.mockResolvedValueOnce({hasMore: true, nextCursor: 'cursor-2'});

        const {result} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await waitFor(() => {
            expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION]).toEqual(expect.objectContaining({hasMore: true, nextCursor: 'cursor-2'}));
        });

        // Keep the next page request in flight so the search starts while it is still pending
        mockOpenSearchTagFiltersPage.mockReturnValueOnce(new Promise(() => {}));

        act(() => {
            result.current.loadMore();
        });

        await waitFor(() => {
            expect(result.current.isLoadingMore).toBe(true);
        });

        mockOpenSearchTagFiltersPage.mockResolvedValueOnce({hasMore: false, nextCursor: ''});

        act(() => {
            result.current.searchTags('marketing');
        });

        await waitFor(() => {
            expect(result.current.isLoadingMore).toBe(false);
        });
    });

    it('re-fetches with the active search query on reconnect while the filter stays mounted', async () => {
        setPartialTagFilterState('travel');
        mockIsOffline = true;

        const {rerender} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await act(async () => {
            await Promise.resolve();
        });
        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();

        mockIsOffline = false;
        rerender({});

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledWith(expect.objectContaining({searchQuery: 'travel', policyIDs: POLICY_ID}), true);
        });
    });

    it('preserves pagination metadata when searching offline and re-fetches on reconnect after clearing', async () => {
        setPartialTagFilterState('');
        mockOpenSearchTagFiltersPage.mockResolvedValueOnce({hasMore: true, nextCursor: 'cursor-1'});

        const {result, rerender} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledTimes(1);
        });

        mockIsOffline = true;
        rerender({});

        act(() => {
            result.current.searchTags('marketing');
        });

        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(true, 'cursor-1', 'marketing', POLICY_ID);

        act(() => {
            result.current.searchTags('');
        });

        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(true, 'cursor-1', '', POLICY_ID);

        mockIsOffline = false;
        mockOpenSearchTagFiltersPage.mockClear();
        rerender({});

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledWith(
                expect.objectContaining({searchQuery: '', policyIDs: POLICY_ID, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE}),
                true,
            );
        });
    });

    it('does not call the API when searching with a complete cached dataset', async () => {
        setCompleteTagFilterState('');

        const {result} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await act(async () => {
            await Promise.resolve();
        });
        mockOpenSearchTagFiltersPage.mockClear();

        act(() => {
            result.current.searchTags('marketing');
        });

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', 'marketing', POLICY_ID);
    });

    it('does not call the API on consecutive keystrokes when searching with a complete cached dataset', async () => {
        setCompleteTagFilterState('');

        const {result} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await act(async () => {
            await Promise.resolve();
        });
        mockOpenSearchTagFiltersPage.mockClear();

        act(() => {
            result.current.searchTags('m');
        });

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', 'm', POLICY_ID);

        act(() => {
            result.current.searchTags('ma');
        });

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', 'ma', POLICY_ID);
    });

    it('re-fetches when clearing a server search that only cached partial results', async () => {
        setPartialTagFilterState('');

        const {result, rerender} = renderHook(() => useSearchTagFilters(POLICY_ID));

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledTimes(1);
        });

        onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {
            hasMore: false,
            nextCursor: '',
            searchQuery: 'ch',
        };
        onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS] = [
            {tagName: 'chicago', tagListName: 'TagList'},
            {tagName: 'charlotte', tagListName: 'TagList'},
        ];
        rerender({});
        mockOpenSearchTagFiltersPage.mockClear();

        act(() => {
            result.current.searchTags('');
        });

        await waitFor(() => {
            expect(mockOpenSearchTagFiltersPage).toHaveBeenCalledWith(
                expect.objectContaining({searchQuery: '', policyIDs: POLICY_ID, cursor: '', limit: CONST.SEARCH.TAG_FILTER_PAGE_SIZE}),
                true,
            );
        });
    });

    it('resets the search query on mount without refetching when the full empty-query dataset is already cached', async () => {
        setCompleteTagFilterState('');

        renderHook(() => useSearchTagFilters(POLICY_ID));

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', '', POLICY_ID);
    });

    it('resets a non-empty search query on unmount and clears partial server results so offline fallback is not poisoned', () => {
        setPartialTagFilterState('marketing');

        const {unmount} = renderHook(() => useSearchTagFilters(POLICY_ID));

        unmount();

        expect(mockClearSearchTagFiltersSearchResults).toHaveBeenCalledWith(POLICY_ID);
        expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS]).toEqual([]);
        expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION]).toEqual(expect.objectContaining({hasMore: false, nextCursor: '', searchQuery: '', policyIDs: POLICY_ID}));

        mockIsOffline = true;
        mockOpenSearchTagFiltersPage.mockClear();

        const {result} = renderHook(() => useSearchTagFilters(POLICY_ID));

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(result.current.searchQuery).toBe('');
        expect(result.current.searchResults).toEqual([]);
    });

    it('resets a non-empty search query on unmount while preserving complete cached tags', () => {
        setCompleteTagFilterState('');

        const {result, unmount} = renderHook(() => useSearchTagFilters(POLICY_ID));

        act(() => {
            result.current.searchTags('marketing');
        });

        expect(result.current.searchQuery).toBe('marketing');

        unmount();

        expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_RESULTS]).toEqual([
            {tagName: '-match', tagListName: 'TagList'},
            {tagName: 'other-tag', tagListName: 'TagList'},
        ]);
        expect(onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION]).toEqual(expect.objectContaining({hasMore: false, nextCursor: '', searchQuery: '', policyIDs: POLICY_ID}));

        mockIsOffline = true;
        mockOpenSearchTagFiltersPage.mockClear();

        const {result: remountResult} = renderHook(() => useSearchTagFilters(POLICY_ID));

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(remountResult.current.searchQuery).toBe('');
        expect(remountResult.current.searchResults).toEqual([
            {tagName: '-match', tagListName: 'TagList'},
            {tagName: 'other-tag', tagListName: 'TagList'},
        ]);
    });

    it('detects policy scope mismatch on remount with different policyIDs and does not return cached results from previous policy', () => {
        setCompleteTagFilterState('', 'policy-1');

        mockIsOffline = true;
        mockOpenSearchTagFiltersPage.mockClear();

        const {result} = renderHook(() => useSearchTagFilters('policy-2'));

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(result.current.searchResults).toBeUndefined();
        expect(result.current.hasMore).toBe(false);
    });
});
