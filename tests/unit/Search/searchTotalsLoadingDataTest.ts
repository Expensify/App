import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';
import type {SearchResultsInfo} from '@src/types/onyx/SearchResults';

import createMock from '../../utils/createMock';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

function getQueryJSON(query = '') {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }

    return queryJSON;
}

const makeRequestWithSideEffectsMock = jest.mocked(makeRequestWithSideEffects);
const waitForWritesMock = jest.mocked(waitForWrites);
type SearchSnapshotKey = `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}`;
type SearchResponse = Response<SearchSnapshotKey>;
type SearchLoadingState = Pick<SearchResultsInfo, 'isLoading'> &
    Partial<{
        [TKey in 'offset' | 'count' | 'reportCount' | 'total' | 'currency']: SearchResultsInfo[TKey] | null;
    }>;

function isSearchLoadingState(value: unknown): value is SearchLoadingState {
    return (
        isRecord(value) &&
        typeof value.isLoading === 'boolean' &&
        (value.offset === null || value.offset === undefined || typeof value.offset === 'number') &&
        (value.count === null || value.count === undefined || typeof value.count === 'number') &&
        (value.reportCount === null || value.reportCount === undefined || typeof value.reportCount === 'number') &&
        (value.total === null || value.total === undefined || typeof value.total === 'number') &&
        (value.currency === null || value.currency === undefined || typeof value.currency === 'string')
    );
}

function buildSearchResponse(offset: number, hasMoreResults: boolean): SearchResponse {
    return createMock<SearchResponse>({
        onyxData: [{value: {search: {offset, hasMoreResults}, data: {}}}],
        jsonCode: CONST.JSON_CODE.SUCCESS,
    });
}

function getSearchLoadingUpdateForHash(hash: number) {
    const [, , requestData] = makeRequestWithSideEffectsMock.mock.calls.at(-1) ?? [];
    const optimisticData = requestData?.optimisticData ?? [];
    const update = optimisticData.find((candidate) => candidate.key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);
    const value: unknown = update?.value;
    const searchState: unknown = isRecord(value) ? value.search : undefined;
    return isSearchLoadingState(searchState) && searchState.isLoading ? searchState : undefined;
}

function getLastSearchRequestJSON() {
    const [, requestParams] = makeRequestWithSideEffectsMock.mock.calls.at(-1) ?? [];
    const parameters: unknown = requestParams;
    if (!isRecord(parameters) || typeof parameters.jsonQuery !== 'string') {
        throw new Error('Search request JSON should be defined');
    }

    return parameters.jsonQuery;
}

describe('search loading totals handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        waitForWritesMock.mockResolvedValue(undefined);
        makeRequestWithSideEffectsMock.mockResolvedValue(buildSearchResponse(0, false));
    });

    it('clears stale totals optimistically for initial load when totals are not requested', async () => {
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: false,
            isLoading: false,
        });

        const loadingSearchData = getSearchLoadingUpdateForHash(queryJSON.hash);
        expect(loadingSearchData).toMatchObject({
            isLoading: true,
            offset: 0,
            count: null,
            reportCount: null,
            total: null,
            currency: null,
        });
        expect(waitForWrites).toHaveBeenCalledWith(READ_COMMANDS.SEARCH);
    });

    it('does not clear totals for initial load when totals are requested', async () => {
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
        });

        const loadingSearchData = getSearchLoadingUpdateForHash(queryJSON.hash);
        expect(loadingSearchData).toMatchObject({
            isLoading: true,
            offset: 0,
        });
        expect(loadingSearchData?.count).toBeUndefined();
        expect(loadingSearchData?.reportCount).toBeUndefined();
        expect(loadingSearchData?.total).toBeUndefined();
        expect(loadingSearchData?.currency).toBeUndefined();
    });

    it('does not clear totals for paginated loads even when totals are not requested', async () => {
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 20,
            shouldCalculateTotals: false,
            isLoading: false,
        });

        const loadingSearchData = getSearchLoadingUpdateForHash(queryJSON.hash);
        expect(loadingSearchData).toMatchObject({
            isLoading: true,
            offset: 20,
        });
        expect(loadingSearchData?.count).toBeUndefined();
        expect(loadingSearchData?.reportCount).toBeUndefined();
        expect(loadingSearchData?.total).toBeUndefined();
        expect(loadingSearchData?.currency).toBeUndefined();
    });

    it('queues a totals request when the same non-totals search is already in flight', async () => {
        const queryJSON = getQueryJSON('type:expense');
        const response = buildSearchResponse(50, true);
        let resolveFirstRequest: (value: SearchResponse) => void = () => {};
        const firstRequestPromise = new Promise<SearchResponse>((resolve) => {
            resolveFirstRequest = resolve;
        });
        makeRequestWithSideEffectsMock.mockImplementationOnce(() => firstRequestPromise);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 50,
            shouldCalculateTotals: false,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 50,
            shouldCalculateTotals: true,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 50,
            shouldCalculateTotals: true,
            isLoading: false,
        });

        await Promise.resolve();
        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(1);

        resolveFirstRequest(response);
        await firstSearch;
        await Promise.resolve();

        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(2);
        const queuedQuery: unknown = JSON.parse(getLastSearchRequestJSON());
        expect(queuedQuery).toEqual(expect.objectContaining({shouldCalculateTotals: true}));
    });

    it('queues a totals request for expense-report when a non-totals search is already in flight', async () => {
        // The totals upgrade is no longer gated to the EXPENSE type: an expense-report totals request that
        // collides with an in-flight non-totals request must still re-fire, otherwise reportCount never
        // arrives and the bulk-actions button spins forever.
        const queryJSON = getQueryJSON('type:expense-report');
        const response = buildSearchResponse(50, true);
        let resolveFirstRequest: (value: SearchResponse) => void = () => {};
        const firstRequestPromise = new Promise<SearchResponse>((resolve) => {
            resolveFirstRequest = resolve;
        });
        makeRequestWithSideEffectsMock.mockImplementationOnce(() => firstRequestPromise);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            offset: 50,
            shouldCalculateTotals: false,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.REPORTS,
            offset: 50,
            shouldCalculateTotals: true,
            isLoading: false,
        });

        await Promise.resolve();
        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(1);

        resolveFirstRequest(response);
        await firstSearch;
        await Promise.resolve();

        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(2);
        const queuedQuery: unknown = JSON.parse(getLastSearchRequestJSON());
        expect(queuedQuery).toEqual(expect.objectContaining({shouldCalculateTotals: true}));
    });

    it('does not queue another request when the in-flight search already calculates totals', async () => {
        const queryJSON = getQueryJSON();
        const response = buildSearchResponse(50, true);
        let resolveFirstRequest: (value: SearchResponse) => void = () => {};
        const firstRequestPromise = new Promise<SearchResponse>((resolve) => {
            resolveFirstRequest = resolve;
        });
        makeRequestWithSideEffectsMock.mockImplementationOnce(() => firstRequestPromise);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 50,
            shouldCalculateTotals: true,
            isLoading: false,
        });
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 50,
            shouldCalculateTotals: true,
            isLoading: false,
        });

        await Promise.resolve();
        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(1);

        resolveFirstRequest(response);
        await firstSearch;

        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(1);
    });

    it('dedupes concurrent search requests by hash and offset', async () => {
        const queryJSON = getQueryJSON();
        let resolveSearch: (value: SearchResponse) => void = () => {};
        const pendingSearch = new Promise<SearchResponse>((resolve) => {
            resolveSearch = resolve;
        });
        makeRequestWithSideEffectsMock.mockReturnValue(pendingSearch);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            skipWaitForWrites: true,
        });
        const secondSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            skipWaitForWrites: true,
        });

        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        expect(JSON.parse(getLastSearchRequestJSON())).toMatchObject({shouldCalculateTotals: true});
        expect(secondSearch).toBeUndefined();

        resolveSearch({jsonCode: CONST.JSON_CODE.SUCCESS});
        await firstSearch;
    });
});
