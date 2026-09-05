import {act, renderHook, waitFor} from '@testing-library/react-native';

import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {clearSearchTagFiltersState, openSearchTagFiltersPage, setSearchTagFiltersPagination} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const mockOpenSearchTagFiltersPage = jest.mocked(openSearchTagFiltersPage);
const mockSetSearchTagFiltersPagination = jest.mocked(setSearchTagFiltersPagination);
const mockClearSearchTagFiltersState = jest.mocked(clearSearchTagFiltersState);

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
    clearSearchTagFiltersState: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    warn: jest.fn(),
}));

const POLICY_ID = 'policy-1';

function setPartialTagFilterState(searchQuery: string) {
    onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {
        hasMore: true,
        nextCursor: 'cursor-1',
        searchQuery,
    };
    onyxData[ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS] = {
        [`${ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS}${POLICY_ID}`]: {
            tag1: {tagName: `${searchQuery}-match`},
        },
    };
}

function setCompleteTagFilterState(searchQuery: string) {
    onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {
        hasMore: false,
        nextCursor: '',
        searchQuery,
    };
    onyxData[ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS] = {
        [`${ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS}${POLICY_ID}`]: {
            tag1: {tagName: `${searchQuery}-match`},
            tag2: {tagName: 'other-tag'},
        },
    };
}

describe('useSearchTagFilters', () => {
    beforeEach(() => {
        for (const key of Object.keys(onyxData)) {
            delete onyxData[key];
        }
        mockIsOffline = false;
        mockUseOnyx.mockClear();
        mockOpenSearchTagFiltersPage.mockClear().mockResolvedValue({hasMore: false, nextCursor: ''});
        mockSetSearchTagFiltersPagination.mockClear().mockImplementation((hasMore, nextCursor, searchQuery) => {
            onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION] = {hasMore, nextCursor, searchQuery};
        });
        mockClearSearchTagFiltersState.mockClear().mockImplementation(() => {
            delete onyxData[ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS];
            delete onyxData[ONYXKEYS.RAM_ONLY_SEARCH_TAG_FILTERS_PAGINATION];
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

    it('clears persisted pagination and cached tags when the filter unmounts', () => {
        setPartialTagFilterState('marketing');

        const {unmount} = renderHook(() => useSearchTagFilters(POLICY_ID));

        unmount();

        expect(mockClearSearchTagFiltersState).toHaveBeenCalledTimes(1);
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
            );
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
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', 'marketing');
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
        onyxData[ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS] = {
            [`${ONYXKEYS.COLLECTION.SEARCH_POLICY_TAGS}${POLICY_ID}`]: {
                tag1: {tagName: 'chicago'},
                tag2: {tagName: 'charlotte'},
            },
        };
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
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', '');
    });
});
