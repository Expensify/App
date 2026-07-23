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
        },
    };
    // Simulate an Onyx snapshot where the search response has not written data yet.
    Reflect.set(searchResults, 'data', undefined);
    return searchResults;
}

describe('useSearchPageSetup', () => {
    beforeEach(() => {
        mockSearch.mockClear();
    });

    it('retries an unresolved search when temporary search prevention clears', async () => {
        const queryJSON = buildSearchQueryJSON('type:expense');
        expect(queryJSON).toBeDefined();
        if (!queryJSON) {
            return;
        }

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
});
