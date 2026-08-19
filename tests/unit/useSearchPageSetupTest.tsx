import {renderHook} from '@testing-library/react-native';

import useSearchPageSetup from '@hooks/useSearchPageSetup';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {SearchKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

import type * as ReactNavigation from '@react-navigation/native';

const mockOpenSearch = jest.fn<void, [unknown, number | undefined]>();
let mockSearchResults: SearchResults | undefined;
let mockIsOffline = false;
let mockLastFocusCallback: (() => void) | undefined;
// Mutable so a test can move a real effect dependency and force the effect to run again.
let mockSearchKey: SearchKey | undefined;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // Mirrors the real hook closely enough for this file: the callback runs on focus and again whenever its
        // identity changes, which is what makes the loop guard below worth asserting.
        useFocusEffect: (callback: () => void) => {
            if (callback === mockLastFocusCallback) {
                return;
            }
            mockLastFocusCallback = callback;
            callback();
        },
    };
});

jest.mock('@libs/actions/Search', () => ({
    search: jest.fn(),
    openSearch: (...args: [unknown, number | undefined]) => mockOpenSearch(...args),
}));

jest.mock('@libs/actions/ReportNavigation', () => ({
    saveLastSearchParams: jest.fn(),
}));

jest.mock('@hooks/useNetwork', () => () => ({isOffline: mockIsOffline}));

jest.mock('@hooks/useSearchShouldCalculateTotals', () => () => false);

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({shouldUseLiveData: false, currentSearchResults: mockSearchResults}),
    useSearchQueryContext: () => ({currentSearchKey: mockSearchKey}),
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
            state: CONST.SEARCH.SNAPSHOT_STATE.LOADED,
            sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            responseJsonCode: 0,
        },
        errors: {error: 'Oops... something went wrong'},
    } as unknown as SearchResults;
}

/** The hashes openSearch() was asked to clear, ignoring the plain calls that only load bank account data. */
function getClearedHashes() {
    return mockOpenSearch.mock.calls.map((call) => call[1]).filter((hash) => hash !== undefined);
}

describe('useSearchPageSetup', () => {
    beforeEach(() => {
        mockOpenSearch.mockClear();
        mockSearchResults = undefined;
        mockSearchKey = undefined;
        mockIsOffline = false;
        mockLastFocusCallback = undefined;
    });

    it('asks OpenSearchPage to clear a snapshot left errored by a failed request', () => {
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        renderHook(() => useSearchPageSetup(queryJSON));

        // Without this the snapshot stays both errored and terminal, which reads as resolved, so the page
        // request never fires and the error view returns on every mount.
        expect(getClearedHashes()).toEqual([queryJSON?.hash]);
    });

    it('does not clear the same hash twice when the failure comes straight back', () => {
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        const {rerender} = renderHook(() => useSearchPageSetup(queryJSON));

        // The request that followed the clear failed and wrote `errors` back, so the snapshot looks clearable
        // again. Move a real dependency too, otherwise the effect never re-runs and this asserts nothing.
        mockSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
        rerender({});

        expect(getClearedHashes()).toEqual([queryJSON?.hash]);
    });

    it('does not clear a query the server rejected as malformed', () => {
        const snapshot = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchResults = {...snapshot, search: {...snapshot.search, responseJsonCode: CONST.JSON_CODE.INVALID_SEARCH_QUERY}};

        renderHook(() => useSearchPageSetup(queryJSON));

        expect(getClearedHashes()).toEqual([]);
    });

    it('does not clear while offline, since the request that would reload the data cannot run', () => {
        mockIsOffline = true;
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);

        renderHook(() => useSearchPageSetup(queryJSON));

        expect(getClearedHashes()).toEqual([]);
    });

    it('leaves a healthy snapshot alone', () => {
        const snapshot = buildErroredSnapshot(queryJSON?.hash ?? 0);
        mockSearchResults = {...snapshot, errors: undefined};

        renderHook(() => useSearchPageSetup(queryJSON));

        expect(getClearedHashes()).toEqual([]);
    });

    it('tracks the clear per hash, so returning to an already-cleared hash does not clear it again', () => {
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        const {rerender} = renderHook(({queryJSON: currentQueryJSON}) => useSearchPageSetup(currentQueryJSON), {initialProps: {queryJSON}});

        // A second, independently errored query opens. It gets its own clear.
        mockSearchResults = buildErroredSnapshot(queryJSONB?.hash ?? 0);
        rerender({queryJSON: queryJSONB});

        // Back to the first query within the same mount. It already used its clear, so nothing more fires.
        mockSearchResults = buildErroredSnapshot(queryJSON?.hash ?? 0);
        rerender({queryJSON});

        expect(getClearedHashes()).toEqual([queryJSON?.hash, queryJSONB?.hash]);
    });
});
