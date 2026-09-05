import {act, renderHook, waitFor} from '@testing-library/react-native';

import useSearchTagFilters from '@hooks/useSearchTagFilters';

import {openSearchTagFiltersPage, setSearchTagFiltersPagination} from '@libs/actions/Search';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const mockOpenSearchTagFiltersPage = jest.mocked(openSearchTagFiltersPage);
const mockSetSearchTagFiltersPagination = jest.mocked(setSearchTagFiltersPagination);

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
        mockSetSearchTagFiltersPagination.mockClear();
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

    it('clears persisted pagination when the filter unmounts', () => {
        const {unmount} = renderHook(() => useSearchTagFilters(POLICY_ID));

        unmount();

        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', '');
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

    it('resets the search query on mount without refetching when the full dataset is already cached', async () => {
        setCompleteTagFilterState('marketing');

        renderHook(() => useSearchTagFilters(POLICY_ID));

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockOpenSearchTagFiltersPage).not.toHaveBeenCalled();
        expect(mockSetSearchTagFiltersPagination).toHaveBeenCalledWith(false, '', '');
    });
});
