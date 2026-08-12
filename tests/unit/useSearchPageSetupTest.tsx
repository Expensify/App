import {renderHook} from '@testing-library/react-native';

import useSearchPageSetup from '@hooks/useSearchPageSetup';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

import type * as ReactNavigation from '@react-navigation/native';

const mockSearch = jest.fn();
let mockSearchResults: SearchResults | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@libs/actions/Search', () => ({
    search: (...args: unknown[]) => {
        mockSearch(...args);
    },
    openSearch: jest.fn(),
}));

jest.mock('@libs/actions/ReportNavigation', () => ({
    saveLastSearchParams: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => () => false);

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({shouldUseLiveData: false, currentSearchResults: mockSearchResults}),
    useSearchQueryContext: () => ({currentSearchKey: undefined}),
    useSearchSelectionActions: () => ({clearSelectedTransactions: jest.fn()}),
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
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            responseJsonCode: 0,
        },
        errors: {error: 'Oops... something went wrong'},
    } as unknown as SearchResults;
}

describe('useSearchPageSetup', () => {
    beforeEach(() => {
        mockSearch.mockClear();
        mockSearchResults = undefined;
    });

    it('re-requests a query whose snapshot was left errored by a failed request', () => {
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        renderHook(() => useSearchPageSetup(queryJSON));

        // Without this, `errors` counts as a resolution and the page stays pinned to its error view
        // with nothing in flight, recoverable only by tapping Try again.
        expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('does not re-request more than once per mount when the retry fails again', () => {
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        const {rerender} = renderHook(() => useSearchPageSetup(queryJSON));
        // The retry failed and wrote `errors` back, so the effect re-runs against the same errored snapshot.
        rerender({});

        expect(mockSearch).toHaveBeenCalledTimes(1);
    });

    it('does not re-request a query the server rejected as malformed', () => {
        const snapshot = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchResults = {...snapshot, search: {...snapshot.search, responseJsonCode: CONST.JSON_CODE.INVALID_SEARCH_QUERY}};

        renderHook(() => useSearchPageSetup(queryJSON));

        expect(mockSearch).not.toHaveBeenCalled();
    });

    it('tracks the retry per hash, so returning to an already-retried hash does not retry it again', () => {
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        const {rerender} = renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});

        // A second, independently errored query mounts. It gets its own retry.
        mockSearchResults = buildErroredSnapshot(queryJSONB?.hash ?? 0);
        rerender({queryJSON: queryJSONB});

        // Back to the first query within the same mount. It already used its retry, so this must not fire a third call.
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        rerender({queryJSON});

        expect(mockSearch).toHaveBeenCalledTimes(2);
    });
});
