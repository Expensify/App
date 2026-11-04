import {getLength as getPersistedRequestsLength, getQueuedInlineEditWritesCount} from '@libs/actions/PersistedRequests';
import {search} from '@libs/actions/Search';
import {makeRequestWithSideEffects, waitForWrites} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import type * as StaleSnapshotMiddleware from '@libs/Middleware/DiscardStaleSearchSnapshot';
import {guardSearchAgainstStaleSnapshot, releaseStaleSnapshotGuard} from '@libs/Middleware/DiscardStaleSearchSnapshot';
import {getIsOffline, subscribe as subscribeNetworkState} from '@libs/NetworkState';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/API', () => ({
    makeRequestWithSideEffects: jest.fn(),
    waitForWrites: jest.fn(),
    write: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@libs/actions/PersistedRequests', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/PersistedRequests'),
    getLength: jest.fn(() => 0),
    getQueuedInlineEditWritesCount: jest.fn(() => 0),
}));

jest.mock('@libs/NetworkState', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/NetworkState'),
    getIsOffline: jest.fn(() => false),
    subscribe: jest.fn(() => () => {}),
}));

jest.mock('@libs/Middleware/DiscardStaleSearchSnapshot', () => ({
    guardSearchAgainstStaleSnapshot: jest.fn(),
    releaseStaleSnapshotGuard: jest.fn(() => false),
}));

const mockedMakeRequestWithSideEffects = jest.mocked(makeRequestWithSideEffects);
const mockedWaitForWrites = jest.mocked(waitForWrites);
const mockedGuard = jest.mocked(guardSearchAgainstStaleSnapshot);
const mockedRelease = jest.mocked(releaseStaleSnapshotGuard);
const mockedGetQueuedInlineEditWritesCount = jest.mocked(getQueuedInlineEditWritesCount);
const mockedGetIsOffline = jest.mocked(getIsOffline);
const mockedSubscribeNetworkState = jest.mocked(subscribeNetworkState);

function getQueryJSON() {
    const queryJSON = buildSearchQueryJSON('type:expense');
    if (!queryJSON) {
        throw new Error('Query JSON should be defined for test setup');
    }
    return queryJSON;
}

// The refetch that follows an edit can return results from before a second, quicker edit. Its snapshot is then dropped,
// and the search has to run again once that edit's write lands.
describe('search stale snapshot re-fire', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGuard.mockReset();
        mockedRelease.mockReset();
        mockedWaitForWrites.mockResolvedValue(undefined);
        mockedMakeRequestWithSideEffects.mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});
        mockedRelease.mockReturnValue(false);
        mockedGetQueuedInlineEditWritesCount.mockReturnValue(0);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(0);
        mockedGetIsOffline.mockReturnValue(false);
    });

    it('waits until the app is back online to run again when it goes offline after its snapshot was dropped', async () => {
        // Given a refetch whose snapshot gets dropped, and the app going offline before it runs again
        const queryJSON = getQueryJSON();
        mockedRelease.mockReturnValueOnce(true);
        mockedMakeRequestWithSideEffects.mockImplementationOnce(() => {
            mockedGetIsOffline.mockReturnValue(true);
            return Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS});
        });

        // When it finishes
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});

        // Then the re-fire isn't sent offline, where it would fail and replace the rows on screen with an error
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);

        // When the network state changes while the app is still offline
        const onNetworkStateChange = mockedSubscribeNetworkState.mock.calls.at(-1)?.[0];
        onNetworkStateChange?.();
        await waitForBatchedUpdates();

        // Then it keeps waiting
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);

        // When the app is back online
        mockedGetIsOffline.mockReturnValue(false);
        onNetworkStateChange?.();
        await waitForBatchedUpdates();

        // Then it runs again, guarded and without a loading state, so the snapshot gets the server's values after the edit
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        expect(mockedGuard).toHaveBeenCalledTimes(2);
        const refireOptimisticData = mockedMakeRequestWithSideEffects.mock.calls.at(1)?.[2]?.optimisticData ?? [];
        expect(JSON.stringify(refireOptimisticData)).not.toContain('"isLoading":true');
    });

    it('runs the search again, without a loading state, when its snapshot was dropped', async () => {
        // Given a refetch whose snapshot gets dropped because a write was queued while it was in flight
        const queryJSON = getQueryJSON();
        mockedRelease.mockReturnValueOnce(true);

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});

        // Then it guarded the exact query it sent after waiting for writes, so other pages of the same hash stay unguarded,
        // and ran again so the snapshot gets the server's values after that write
        const guardedJsonQuery = mockedGuard.mock.calls.at(0)?.[0];
        expect(guardedJsonQuery).toEqual(expect.any(String));
        expect(mockedMakeRequestWithSideEffects).toHaveBeenNthCalledWith(1, READ_COMMANDS.SEARCH, expect.objectContaining({jsonQuery: guardedJsonQuery}), expect.anything());
        expect(mockedRelease).toHaveBeenCalledWith(guardedJsonQuery);
        expect(mockedWaitForWrites).toHaveBeenCalledTimes(2);
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        const refireOptimisticData = mockedMakeRequestWithSideEffects.mock.calls.at(1)?.[2]?.optimisticData ?? [];
        expect(JSON.stringify(refireOptimisticData)).not.toContain('"isLoading":true');
    });

    it('runs only once when its snapshot was kept', async () => {
        // Given a refetch whose response is fresh
        const queryJSON = getQueryJSON();

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});

        // Then it reaches the backend once
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });

    it.each([
        [false, false],
        [false, true],
        [true, false],
        [true, true],
    ])('does not loop with older pending writes (new local edit: %s, skip wait: %s)', async (hasNewWrite, skipWaitForWrites) => {
        // Given a follower whose write barrier resolves despite older writes still pending in the leader tab
        const queryJSON = getQueryJSON();
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${queryJSON.hash}` as const;
        const snapshotResults: boolean[] = [];
        const realMiddleware = jest.requireActual<typeof StaleSnapshotMiddleware>('@libs/Middleware/DiscardStaleSearchSnapshot');
        mockedGuard.mockImplementation(realMiddleware.guardSearchAgainstStaleSnapshot);
        mockedRelease.mockImplementation(realMiddleware.releaseStaleSnapshotGuard);
        mockedGetQueuedInlineEditWritesCount.mockReturnValue(3);
        jest.mocked(getPersistedRequestsLength).mockReturnValue(1);
        mockedMakeRequestWithSideEffects.mockImplementation(async (command, data) => {
            // Limit requests so the regression fails instead of hanging if unchanged pending writes trigger a loop
            if (mockedMakeRequestWithSideEffects.mock.calls.length > 2) {
                throw new Error('Search repeated without a new write');
            }
            if (hasNewWrite) {
                mockedGetQueuedInlineEditWritesCount.mockReturnValue(4);
            }
            const response = await realMiddleware.default(
                Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS, onyxData: [{onyxMethod: 'merge', key: snapshotKey, value: {data: {}}}]}),
                {command, data: data ?? undefined},
                false,
            );
            snapshotResults.push(response?.onyxData?.some((update) => update.key === snapshotKey) ?? false);
            return response;
        });

        // When the guarded search and any necessary rerun pass through the real discard middleware
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true, skipWaitForWrites});

        // Then an in-flight write still drops the first snapshot, but unchanged pending writes cannot trigger more reruns
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(hasNewWrite ? 2 : 1);
        expect(snapshotResults).toEqual(hasNewWrite ? [false, true] : [true]);
        expect(mockedWaitForWrites).toHaveBeenCalledTimes((skipWaitForWrites ? 0 : 1) + (hasNewWrite ? 1 : 0));
        expect(getPersistedRequestsLength()).toBe(1);
    });

    it('does not guard a search that did not ask for it', async () => {
        // Given a regular search, like the one the page load fires
        const queryJSON = getQueryJSON();

        // When it is sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});

        // Then its response is never dropped, so the first results of a search always land
        expect(mockedGuard).not.toHaveBeenCalled();
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });

    it.each([false, true])('guards an already sent search when a guarded refetch joins while loading (skip wait: %s)', async (skipWaitForWrites) => {
        // Given a regular search sent when 5 requests had been queued, and still in flight
        const queryJSON = getQueryJSON();
        let resolveRequest: (value: Response<OnyxKey>) => void = () => {};
        mockedMakeRequestWithSideEffects.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveRequest = resolve;
            }),
        );
        mockedGetQueuedInlineEditWritesCount.mockReturnValue(5);
        const pageSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, skipWaitForWrites});
        await waitForBatchedUpdates();
        expect(mockedGuard).not.toHaveBeenCalled();

        // When an edit queues a write and triggers a refetch that wants the guard while the results still show loading
        mockedGetQueuedInlineEditWritesCount.mockReturnValue(6);
        search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: true, shouldDiscardStaleSnapshot: true});

        // Then the search in flight is guarded right away, with the query it sent and the count from when it was sent, so the
        // edit's write counts against its response even if that write finishes first
        const guardedJsonQuery = mockedGuard.mock.calls.at(0)?.[0];
        expect(guardedJsonQuery).toEqual(expect.any(String));
        expect(mockedGuard).toHaveBeenNthCalledWith(1, guardedJsonQuery, 5);
        expect(mockedMakeRequestWithSideEffects).toHaveBeenNthCalledWith(1, READ_COMMANDS.SEARCH, expect.objectContaining({jsonQuery: guardedJsonQuery}), expect.anything());

        // When its snapshot is dropped because the edit's write was queued while it was in flight
        mockedRelease.mockReturnValueOnce(true);
        resolveRequest({jsonCode: CONST.JSON_CODE.SUCCESS});
        await pageSearch;

        // Then it runs again, guarded, so the snapshot gets the server's values after the edit
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        expect(mockedGuard).toHaveBeenCalledTimes(2);
        expect(mockedWaitForWrites).toHaveBeenCalledTimes(skipWaitForWrites ? 1 : 2);
    });

    it('waits for edits before a pending totals upgrade when the original and joining calls skipped the wait', async () => {
        // Given an unguarded skip-wait search still in flight
        const queryJSON = getQueryJSON();
        let resolveRequest: (value: Response<OnyxKey>) => void = () => {};
        mockedMakeRequestWithSideEffects.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveRequest = resolve;
            }),
        );
        const pageSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, skipWaitForWrites: true});

        // When a guarded totals upgrade joins and an edit is queued before the original response arrives
        search({
            queryJSON,
            searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES,
            offset: 0,
            isLoading: false,
            skipWaitForWrites: true,
            shouldCalculateTotals: true,
            shouldDiscardStaleSnapshot: true,
        });
        mockedGetQueuedInlineEditWritesCount.mockReturnValue(1);
        let finishWrites: () => void = () => {};
        mockedWaitForWrites.mockReturnValueOnce(
            new Promise((resolve) => {
                finishWrites = () => resolve(undefined);
            }),
        );
        resolveRequest({jsonCode: CONST.JSON_CODE.SUCCESS});
        await waitForBatchedUpdates();

        // Then the pending upgrade also waits for writes rather than repeating the bypass
        expect(mockedWaitForWrites).toHaveBeenCalledTimes(1);
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        finishWrites();
        await pageSearch;
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
        const upgradedParams = mockedMakeRequestWithSideEffects.mock.calls.at(1)?.[1];
        if (!upgradedParams || !('jsonQuery' in upgradedParams) || typeof upgradedParams.jsonQuery !== 'string') {
            throw new Error('Expected a search query for the totals upgrade');
        }
        expect(upgradedParams.jsonQuery).toContain('"shouldCalculateTotals":true');
    });

    it('defers an originally unguarded search that gains the guard while waiting and then goes offline', async () => {
        // Given a regular search still waiting for writes
        const queryJSON = getQueryJSON();
        let finishWrites: () => void = () => {};
        mockedWaitForWrites.mockReturnValueOnce(
            new Promise((resolve) => {
                finishWrites = () => resolve(undefined);
            }),
        );
        const pageSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});

        // When a guarded refetch joins and the app goes offline before the wait ends
        search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});
        mockedGetIsOffline.mockReturnValue(true);
        finishWrites();
        await pageSearch;

        // Then the upgraded request is not sent offline and resumes guarded when the app reconnects
        expect(mockedMakeRequestWithSideEffects).not.toHaveBeenCalled();
        const onNetworkStateChange = mockedSubscribeNetworkState.mock.calls.at(-1)?.[0];
        expect(onNetworkStateChange).toEqual(expect.any(Function));
        mockedGetIsOffline.mockReturnValue(false);
        onNetworkStateChange?.();
        await waitForBatchedUpdates();
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
        expect(mockedGuard).toHaveBeenCalledTimes(1);
    });

    it('runs again when a write was queued since it was sent, even if its snapshot passed the guard', async () => {
        // Given a guarded search whose response passes the guard before a refetch for a new edit joins it
        const queryJSON = getQueryJSON();
        mockedMakeRequestWithSideEffects.mockImplementationOnce(() => {
            mockedGetQueuedInlineEditWritesCount.mockReturnValue(1);
            return Promise.resolve({jsonCode: CONST.JSON_CODE.SUCCESS});
        });

        // When it finishes with the edit's write queued since it was sent
        await search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});

        // Then it runs again, because the snapshot it applied can't include that write
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(2);
    });

    it('guards a search still waiting for writes once it is sent, when a refetch that wants the guard joins it', async () => {
        // Given a regular search still waiting for the write queue to go idle
        const queryJSON = getQueryJSON();
        let finishWrites: () => void = () => {};
        mockedWaitForWrites.mockReturnValueOnce(
            new Promise((resolve) => {
                finishWrites = () => resolve(undefined);
            }),
        );
        const refreshSearch = search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false});

        // When a refetch that wants the guard joins it
        search({queryJSON, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES, offset: 0, isLoading: false, shouldDiscardStaleSnapshot: true});
        expect(mockedGuard).not.toHaveBeenCalled();
        finishWrites();
        await refreshSearch;

        // Then the joined search guards itself when it is sent, and only one request reaches the backend
        expect(mockedGuard).toHaveBeenCalledTimes(1);
        expect(mockedMakeRequestWithSideEffects).toHaveBeenCalledTimes(1);
    });
});
