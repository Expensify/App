import {markInFlightSearchRequestsStale, search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import discardStaleSearchSnapshot from '@libs/Middleware/DiscardStaleSearchSnapshot';
import {getIsOffline} from '@libs/NetworkState';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({makeRequestWithSideEffects: jest.fn(), waitForWrites: jest.fn(), write: jest.fn(), read: jest.fn()}));
jest.mock('@libs/NetworkState', () => ({...jest.requireActual<Record<string, unknown>>('@libs/NetworkState'), getIsOffline: jest.fn(() => false)}));

const mockedRequest = jest.mocked(makeRequestWithSideEffects);
const mockedWait = jest.mocked(waitForWrites);
const mockedOffline = jest.mocked(getIsOffline);

function getQueryJSON(inputQuery = 'type:expense') {
    const query = buildSearchQueryJSON(inputQuery);
    if (!query) {
        throw new Error('Expected a search query');
    }
    return query;
}

function defer<T>() {
    let resolve: (value: T) => void = () => {};
    const promise = new Promise<T>((resolver) => {
        resolve = resolver;
    });
    return {promise, resolve};
}

describe('explicit Search snapshot invalidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedWait.mockReset().mockResolvedValue(undefined);
        mockedRequest.mockReset().mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        mockedOffline.mockReturnValue(false);
    });

    it.each([false, true])('drops a sent snapshot after repeated edits and fetches again once without loading (skip wait: %s)', async (skipWaitForWrites) => {
        // Given a sent search whose old response is still in flight
        const queryJSON = getQueryJSON();
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const;
        const response = defer<Response<OnyxKey>>();
        const snapshotsKept: boolean[] = [];
        mockedRequest.mockImplementationOnce(async (command, data) => {
            const result = await discardStaleSearchSnapshot(response.promise, {command, data: data ?? undefined}, false);
            snapshotsKept.push(result?.onyxData?.some((update) => update.key === snapshotKey) ?? false);
            return result;
        });
        const pending = search({queryJSON, searchKey: undefined, offset: 50, isLoading: false, skipWaitForWrites});
        await waitForBatchedUpdates();

        // When two inline edits invalidate it before its old snapshot arrives
        markInFlightSearchRequestsStale(queryJSON.hash);
        markInFlightSearchRequestsStale(queryJSON.hash);
        const writes = defer<void>();
        mockedWait.mockReturnValueOnce(writes.promise);
        response.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]});
        await waitForBatchedUpdates();

        // Then the real middleware drops the snapshot and the refetch waits for the edits
        expect(snapshotsKept).toEqual([false]);
        expect(mockedRequest).toHaveBeenCalledTimes(1);
        writes.resolve();
        await pending;
        expect(mockedRequest).toHaveBeenCalledTimes(2);
        const refetch = mockedRequest.mock.calls.at(1);
        expect(refetch?.[1]).toEqual(mockedRequest.mock.calls.at(0)?.[1]);
        expect(JSON.stringify(refetch?.[2]?.optimisticData)).not.toContain('"isLoading":true');
    });

    it('does not invalidate a request still waiting for writes', async () => {
        // Given a search waiting for the edit to finish
        const writes = defer<void>();
        mockedWait.mockReturnValueOnce(writes.promise);
        const queryJSON = getQueryJSON();
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const;
        mockedRequest.mockImplementationOnce((command, data) =>
            discardStaleSearchSnapshot(
                Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]}),
                {command, data: data ?? undefined},
                false,
            ),
        );
        const pending = search({queryJSON, searchKey: undefined, isLoading: false});

        // When another inline edit happens before dispatch
        markInFlightSearchRequestsStale(queryJSON.hash);
        writes.resolve();
        await pending;

        // Then the response already includes it, so no replacement request is needed
        expect(mockedRequest).toHaveBeenCalledTimes(1);
    });

    it.each([true, false])('invalidates only pages of the edited snapshot (edit has a hash: %s)', async (hasHash) => {
        // Given two sent pages of the edited query and an unrelated search loading its first results
        const queryJSON = getQueryJSON();
        const otherQueryJSON = getQueryJSON('type:expense status:paid');
        expect(otherQueryJSON.hash).not.toBe(queryJSON.hash);
        const response = defer<void>();
        const snapshotsKept: boolean[] = [];
        const pending = [
            {queryJSON, offset: 0},
            {queryJSON, offset: 50},
            {queryJSON: otherQueryJSON, offset: 0},
        ].map(({queryJSON: query, offset}) => {
            const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${query.hash}` as const;
            mockedRequest.mockImplementationOnce(async (command, data) => {
                await response.promise;
                const result = await discardStaleSearchSnapshot(
                    Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]}),
                    {command, data: data ?? undefined},
                    false,
                );
                snapshotsKept.push(result?.onyxData?.some((update) => update.key === snapshotKey) ?? false);
                return result;
            });
            return Promise.resolve(search({queryJSON: query, searchKey: undefined, offset, isLoading: false, skipWaitForWrites: true}));
        });

        // When a Search inline edit supplies its hash, or an Expense Report edit supplies no hash
        markInFlightSearchRequestsStale(hasHash ? queryJSON.hash : undefined);
        response.resolve();
        await Promise.all(pending);

        // Then only matching pages are dropped and fetched again; unrelated first results always survive
        expect(snapshotsKept).toEqual(hasHash ? [false, false, true] : [true, true, true]);
        expect(mockedRequest).toHaveBeenCalledTimes(hasHash ? 5 : 3);
        expect(mockedWait).toHaveBeenCalledTimes(hasHash ? 2 : 0);
    });

    it('waits for edits before a pending totals upgrade even if both calls skipped writes', async () => {
        // Given a sent search and a joining totals request
        const queryJSON = getQueryJSON();
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const;
        const response = defer<Response<OnyxKey>>();
        mockedRequest.mockImplementationOnce((command, data) => discardStaleSearchSnapshot(response.promise, {command, data: data ?? undefined}, false));
        const pending = search({queryJSON, searchKey: undefined, isLoading: false, skipWaitForWrites: true});
        search({queryJSON, searchKey: undefined, isLoading: false, skipWaitForWrites: true, shouldCalculateTotals: true});

        // When an edit invalidates the first response
        markInFlightSearchRequestsStale(queryJSON.hash);
        const writes = defer<void>();
        mockedWait.mockReturnValueOnce(writes.promise);
        response.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]});
        await waitForBatchedUpdates();

        // Then the single upgraded request waits for writes rather than fetching old totals
        expect(mockedRequest).toHaveBeenCalledTimes(1);
        writes.resolve();
        await pending;
        expect(mockedRequest).toHaveBeenCalledTimes(2);
        expect(JSON.stringify(mockedRequest.mock.calls.at(1)?.[1])).toContain('shouldCalculateTotals');
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('cleans invalidation after a rejected request so the next search is fresh', async () => {
        // Given a sent request that will fail without reaching the middleware
        const response = defer<Response<OnyxKey>>();
        mockedRequest.mockReturnValueOnce(
            response.promise.then(() => {
                throw new Error('Network failure');
            }),
        );
        const queryJSON = getQueryJSON();
        const pending = search({queryJSON, searchKey: undefined, isLoading: false, skipWaitForWrites: true});
        markInFlightSearchRequestsStale(queryJSON.hash);

        // When it fails and the same query is retried
        response.resolve({jsonCode: CONST.JSON_CODE.SUCCESS});
        await pending;
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const;
        mockedRequest.mockImplementationOnce((command, data) =>
            discardStaleSearchSnapshot(Promise.resolve({jsonCode: 200, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]}), {command, data: data ?? undefined}, false),
        );
        await search({queryJSON, searchKey: undefined, isLoading: false});

        // Then no stale marker survives to cause an unnecessary third request
        expect(mockedRequest).toHaveBeenCalledTimes(2);
    });

    it('does not refetch a dropped snapshot while offline', async () => {
        // Given a sent search invalidated by an inline edit
        const queryJSON = getQueryJSON();
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const;
        const response = defer<Response<OnyxKey>>();
        mockedRequest.mockImplementationOnce((command, data) => discardStaleSearchSnapshot(response.promise, {command, data: data ?? undefined}, false));
        const pending = search({queryJSON, searchKey: undefined, isLoading: false, skipWaitForWrites: true});
        markInFlightSearchRequestsStale(queryJSON.hash);

        // When the app goes offline before the stale response finishes
        mockedOffline.mockReturnValue(true);
        response.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]});
        await pending;

        // Then the optimistic rows are not covered by a failing offline refetch
        expect(mockedRequest).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
});
