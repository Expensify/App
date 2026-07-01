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

function getMakeRequestWithSideEffectsMock() {
    return makeRequestWithSideEffects as unknown as {
        mock: {
            calls: Array<[unknown, unknown, SearchRequestData?]>;
        };
        mockResolvedValue: (value: {onyxData: Array<{value: {search: {offset: number; hasMoreResults: boolean}; data: Record<string, unknown>}}>; jsonCode: number}) => void;
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
});
