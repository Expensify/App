import {renderHook} from '@testing-library/react-native';

import useSearchLoadingState from '@hooks/useSearchLoadingState';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import type SearchResults from '@src/types/onyx/SearchResults';

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}],
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchResultsContext: () => ({shouldUseLiveData: false}),
}));

const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);

const buildErroredSnapshot = (responseJsonCode: number | null) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the hook only reads errors and the response code, so the fixture is intentionally partial
    ({
        errors: {error: 'Something went wrong'},
        search: {responseJsonCode},
    }) as unknown as SearchResults;

const buildLoadedSnapshot = (hash: number | undefined) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the hook only reads data and the fields isSearchDataLoaded checks, so the fixture is intentionally partial
    ({
        data: {},
        search: {type: CONST.SEARCH.DATA_TYPES.EXPENSE, state: CONST.SEARCH.SNAPSHOT_STATE.LOADED, hash},
    }) as unknown as SearchResults;

describe('useSearchLoadingState', () => {
    it('keeps the page skeleton while the errors are waiting for their response code', () => {
        // Given a failed search whose errors landed before search() stored the response code
        const searchResults = buildErroredSnapshot(null);

        // When the page decides whether to show its skeleton
        const {result} = renderHook(() => useSearchLoadingState(queryJSON, searchResults));

        // Then it keeps the skeleton, because handing off to Search's own skeleton would move the rows and restart the shimmer
        expect(result.current).toBe(true);
    });

    it('lets Search render the error view once the response code is stored', () => {
        // Given a failed search whose response code is known
        const searchResults = buildErroredSnapshot(CONST.JSON_CODE.NO_RESPONSE);

        // When the page decides whether to show its skeleton
        const {result} = renderHook(() => useSearchLoadingState(queryJSON, searchResults));

        // Then it drops the skeleton so Search can pick the right error copy
        expect(result.current).toBe(false);
    });

    it('keeps the page skeleton while the only data on hand belongs to another query', () => {
        // Given results for the ungrouped query while the user just applied a group by
        const groupedQueryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} group-by:${CONST.SEARCH.GROUP_BY.DAY}`);
        const searchResults = buildLoadedSnapshot(queryJSON?.hash);

        // When the page decides whether to show its skeleton for the grouped query
        const {result} = renderHook(() => useSearchLoadingState(groupedQueryJSON, searchResults));

        // Then it keeps the skeleton, because Search would treat the other query's data as not loaded and flash its empty state
        expect(result.current).toBe(true);
    });

    it('lets Search render once the data belongs to the current query', () => {
        // Given results that were fetched for the current query
        const searchResults = buildLoadedSnapshot(queryJSON?.hash);

        // When the page decides whether to show its skeleton
        const {result} = renderHook(() => useSearchLoadingState(queryJSON, searchResults));

        // Then it drops the skeleton so Search can render the results
        expect(result.current).toBe(false);
    });
});
