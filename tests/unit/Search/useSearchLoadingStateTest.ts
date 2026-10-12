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
});
