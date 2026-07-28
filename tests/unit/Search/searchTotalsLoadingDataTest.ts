import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

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

/** Narrows an Onyx.merge payload to the `{search: {isLoading: false}}` write that settles a snapshot. */
function isLoadingClear(value: unknown) {
    if (typeof value !== 'object' || value === null || !('search' in value)) {
        return false;
    }

    const {search: searchValue} = value;
    return typeof searchValue === 'object' && searchValue !== null && 'isLoading' in searchValue && searchValue.isLoading === false;
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

    describe('in-flight request deduping', () => {
        // Both calls run before any microtask, so the first request is still registered as in flight when the
        // second one is made.
        function searchTwiceConcurrently(firstShouldCalculateTotals: boolean, secondShouldCalculateTotals: boolean) {
            const queryJSON = getQueryJSON();
            const params = {queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false};

            return Promise.all([search({...params, shouldCalculateTotals: firstShouldCalculateTotals}), search({...params, shouldCalculateTotals: secondShouldCalculateTotals})]);
        }

        it('drops a request that duplicates an in-flight one for the same page', async () => {
            await searchTwiceConcurrently(false, false);

            expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        });

        it('does not drop a totals request that overlaps an in-flight request which did not ask for totals', async () => {
            await searchTwiceConcurrently(false, true);

            expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        });

        it('drops a non-totals request while a totals request for the same page is in flight', async () => {
            await searchTwiceConcurrently(true, false);

            expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        });

        it('drops a totals request that duplicates an in-flight totals request', async () => {
            await searchTwiceConcurrently(true, true);

            expect(makeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        });

        it('does not hand the API layer a finallyData that would settle the snapshot mid-flight', async () => {
            const queryJSON = getQueryJSON();

            await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, shouldCalculateTotals: true, isLoading: false});

            const [, , requestData] = getMakeRequestWithSideEffectsMock().mock.calls.at(-1) ?? [];
            expect(requestData).not.toHaveProperty('finallyData');
        });

        it('clears the snapshot loading state once the last overlapping request settles', async () => {
            const queryJSON = getQueryJSON();
            const onyxMergeSpy = jest.spyOn(Onyx, 'merge');

            await searchTwiceConcurrently(false, true);

            const loadingClears = onyxMergeSpy.mock.calls.filter(([key, value]) => key === `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` && isLoadingClear(value));

            // Two requests overlap on one snapshot, but only the one that finishes last may report it as settled.
            expect(loadingClears).toHaveLength(1);
            onyxMergeSpy.mockRestore();
        });
    });
});
