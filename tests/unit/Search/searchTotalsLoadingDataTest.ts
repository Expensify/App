import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {buildFlatQueryWithoutGroupBy, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('');
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

type SearchRequestParams = {
    hash: number;
    jsonQuery: string;
};

function getMakeRequestWithSideEffectsMock() {
    return makeRequestWithSideEffects as unknown as {
        mock: {
            calls: Array<[unknown, SearchRequestParams, SearchRequestData?]>;
        };
        mockResolvedValue: (value: {onyxData: Array<{value: {search: {offset: number; hasMoreResults: boolean}; data: Record<string, unknown>}}>; jsonCode: number}) => void;
        mockReturnValue: (value: Promise<unknown>) => void;
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

function getLastSearchRequestParams() {
    const makeRequestWithSideEffectsMock = getMakeRequestWithSideEffectsMock();
    const [, requestParams] = makeRequestWithSideEffectsMock.mock.calls.at(-1) ?? [];
    if (!requestParams) {
        throw new Error('Search request params should be defined');
    }

    return requestParams;
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

    it('passes targetCurrency in the serialized search query', async () => {
        const queryJSON = getQueryJSON();

        await search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            targetCurrency: 'AUD',
        });

        expect(JSON.parse(getLastSearchRequestParams().jsonQuery)).toMatchObject({
            targetCurrency: 'AUD',
            shouldCalculateTotals: true,
        });
    });

    it('removes grouping filters when building a flat footer totals query', () => {
        const queryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} group-by:${CONST.SEARCH.GROUP_BY.CATEGORY} group-currency:AUD`);
        if (!queryJSON) {
            throw new Error('Grouped query JSON should be defined for test setup');
        }

        const flatQueryJSON = buildFlatQueryWithoutGroupBy(queryJSON);

        expect(flatQueryJSON?.groupBy).toBeUndefined();
        expect(flatQueryJSON?.flatFilters.some((filter) => filter.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY)).toBe(false);
    });

    it('scopes the flat footer totals query hash by target currency to avoid colliding with the ungrouped search snapshot', () => {
        // Given a grouped search and the equivalent user-facing ungrouped search
        const groupedQueryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE} group-by:${CONST.SEARCH.GROUP_BY.CATEGORY}`);
        const ungroupedQueryJSON = buildSearchQueryJSON(`type:${CONST.SEARCH.DATA_TYPES.EXPENSE}`);
        if (!groupedQueryJSON || !ungroupedQueryJSON) {
            throw new Error('Query JSON should be defined for test setup');
        }

        // When the footer requests converted totals for two different currencies
        const flatQueryForAUD = buildFlatQueryWithoutGroupBy(groupedQueryJSON, 'AUD');
        const flatQueryForEUR = buildFlatQueryWithoutGroupBy(groupedQueryJSON, 'EUR');
        const flatQueryWithoutCurrency = buildFlatQueryWithoutGroupBy(groupedQueryJSON);

        // Then each currency yields a distinct hash that does not match the ungrouped search snapshot hash
        expect(flatQueryForAUD?.hash).not.toBe(ungroupedQueryJSON.hash);
        expect(flatQueryForEUR?.hash).not.toBe(ungroupedQueryJSON.hash);
        expect(flatQueryForAUD?.hash).not.toBe(flatQueryForEUR?.hash);
        expect(flatQueryWithoutCurrency?.hash).toBe(ungroupedQueryJSON.hash);
    });

    it('dedupes concurrent search requests by hash and offset', async () => {
        const queryJSON = getQueryJSON();
        let resolveSearch: (value: unknown) => void = () => {};
        const pendingSearch = new Promise((resolve) => {
            resolveSearch = resolve;
        });
        getMakeRequestWithSideEffectsMock().mockReturnValue(pendingSearch);

        const firstSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            skipWaitForWrites: true,
            targetCurrency: 'AUD',
        });
        const secondSearch = search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            shouldCalculateTotals: true,
            isLoading: false,
            skipWaitForWrites: true,
            targetCurrency: 'USD',
        });

        expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        expect(JSON.parse(getLastSearchRequestParams().jsonQuery)).toMatchObject({targetCurrency: 'AUD'});
        expect(secondSearch).toBeUndefined();

        resolveSearch({jsonCode: CONST.JSON_CODE.SUCCESS});
        await firstSearch;
    });
});
