import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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

type SearchLoadingState = {
    isLoading?: boolean;
    offset?: number;
    count?: number | null;
    total?: number | null;
    currency?: string | null;
};

type SearchRequestData = {
    optimisticData?: Array<{
        key: string;
        value?: {
            search?: SearchLoadingState;
        };
    }>;
};

type SearchResponse = {
    onyxData: Array<{value: {search: {offset: number; hasMoreResults: boolean}; data: Record<string, unknown>}}>;
    jsonCode: number;
};

function getMakeRequestWithSideEffectsMock() {
    return makeRequestWithSideEffects as unknown as {
        mock: {
            calls: Array<[unknown, {jsonQuery?: string}, SearchRequestData?]>;
        };
        mockResolvedValue: (value: SearchResponse) => void;
        mockImplementationOnce: (implementation: () => Promise<SearchResponse>) => void;
    };
}

function getWaitForWritesMock() {
    return waitForWrites as unknown as {
        mockResolvedValue: (value: void) => void;
    };
}

function getSearchLoadingUpdateForHash(hash: number) {
    const makeRequestWithSideEffectsMock = getMakeRequestWithSideEffectsMock();
    const [, , requestData] = makeRequestWithSideEffectsMock.mock.calls.at(-1) ?? [];
    const optimisticData = requestData?.optimisticData ?? [];
    return optimisticData.find((update) => update.key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` && !!update.value?.search?.isLoading)?.value?.search;
}

describe('search loading totals handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getWaitForWritesMock().mockResolvedValue(undefined);
        getMakeRequestWithSideEffectsMock().mockResolvedValue({
            onyxData: [{value: {search: {offset: 0, hasMoreResults: false}, data: {}}}],
            jsonCode: CONST.JSON_CODE.SUCCESS,
        });
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
        expect(loadingSearchData?.total).toBeUndefined();
        expect(loadingSearchData?.currency).toBeUndefined();
    });

    it('queues a totals request when the same non-totals search is already in flight', async () => {
        const queryJSON = getQueryJSON('type:expense');
        const response: SearchResponse = {
            onyxData: [{value: {search: {offset: 50, hasMoreResults: true}, data: {}}}],
            jsonCode: CONST.JSON_CODE.SUCCESS,
        };
        let resolveFirstRequest: (value: SearchResponse) => void = () => {};
        const firstRequestPromise = new Promise<SearchResponse>((resolve) => {
            resolveFirstRequest = resolve;
        });
        const makeRequestWithSideEffectsMock = getMakeRequestWithSideEffectsMock();
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
        const [, queuedRequestParameters] = makeRequestWithSideEffectsMock.mock.calls.at(-1) ?? [];
        const queuedQuery: unknown = JSON.parse(queuedRequestParameters?.jsonQuery ?? '{}');
        expect(queuedQuery).toEqual(expect.objectContaining({shouldCalculateTotals: true}));
    });

    it('keeps the original expense-report deduplication when a totals request collides with an in-flight request', async () => {
        const queryJSON = getQueryJSON('type:expense-report');
        const response: SearchResponse = {
            onyxData: [{value: {search: {offset: 50, hasMoreResults: true}, data: {}}}],
            jsonCode: CONST.JSON_CODE.SUCCESS,
        };
        let resolveFirstRequest: (value: SearchResponse) => void = () => {};
        const firstRequestPromise = new Promise<SearchResponse>((resolve) => {
            resolveFirstRequest = resolve;
        });
        const makeRequestWithSideEffectsMock = getMakeRequestWithSideEffectsMock();
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

        expect(makeRequestWithSideEffectsMock.mock.calls).toHaveLength(1);
    });

    it('does not queue another request when the in-flight search already calculates totals', async () => {
        const queryJSON = getQueryJSON();
        const response: SearchResponse = {
            onyxData: [{value: {search: {offset: 50, hasMoreResults: true}, data: {}}}],
            jsonCode: CONST.JSON_CODE.SUCCESS,
        };
        let resolveFirstRequest: (value: SearchResponse) => void = () => {};
        const firstRequestPromise = new Promise<SearchResponse>((resolve) => {
            resolveFirstRequest = resolve;
        });
        const makeRequestWithSideEffectsMock = getMakeRequestWithSideEffectsMock();
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
});
