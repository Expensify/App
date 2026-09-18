import Log from '@libs/Log';

import type {OnyxInput, OnyxKey} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import type Request from '../../src/types/onyx/Request';

import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import ONYXKEYS from '../../src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const request: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
    command: 'OpenReport',
    successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
    failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
    requestIndex: 1,
};

class MockFile extends Blob {
    name = 'mock-file';

    source = 'mock-file';

    lastModified = 0;

    webkitRelativePath = '';

    public constructor(fileBits: BlobPart[] = [], fileName = 'mock-file', options?: FilePropertyBag) {
        super(fileBits, options);
        this.name = fileName;
        this.lastModified = options?.lastModified ?? 0;
    }
}

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
    }),
);

beforeEach(() => {
    wrapOnyxWithWaitForBatchedUpdates(Onyx);
    PersistedRequests.clear();
    PersistedRequests.save(request);
});

afterEach(() => {
    PersistedRequests.clear();
    Onyx.clear();
});

describe('PersistedRequests', () => {
    it('save a request without conflicts', () => {
        PersistedRequests.save(request);
        expect(PersistedRequests.getAll().length).toBe(2);
    });

    it('remove a request from the PersistedRequests array', () => {
        PersistedRequests.endRequestAndRemoveFromQueue(request);
        expect(PersistedRequests.getAll().length).toBe(0);
    });

    it('when process the next request, queue should be empty', () => {
        const nextRequest = PersistedRequests.processNextRequest();
        expect(PersistedRequests.getAll().length).toBe(0);
        expect(nextRequest).toEqual(request);
    });

    it('when onyx persist the request, it should remove from the list the ongoing request', () => {
        expect(PersistedRequests.getAll().length).toBe(1);
        const request2: Request<'reportMetadata_3' | 'reportMetadata_4'> = {
            command: 'AddComment',
            successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
            requestIndex: 2,
        };
        PersistedRequests.save(request2);
        PersistedRequests.processNextRequest();
        return waitForBatchedUpdates().then(() => {
            expect(PersistedRequests.getAll().length).toBe(1);
            expect(PersistedRequests.getAll().at(0)).toEqual(request2);
        });
    });

    it('update the request at the given index with new data', () => {
        const newRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'OpenReport',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
            requestIndex: 3,
        };
        PersistedRequests.update(0, newRequest);
        expect(PersistedRequests.getAll().at(0)).toEqual(newRequest);
    });

    it('update the request carrying the given requestIndex instead of the one at the stale index', () => {
        // Given three queued requests, with the one at index 1 carrying requestIndex 11
        const logInfoSpy = jest.spyOn(Log, 'info').mockImplementation(() => {});
        PersistedRequests.save({...request, requestIndex: 11});
        PersistedRequests.save({...request, command: 'AddComment', requestIndex: 12});
        const newRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'AddComment',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
            requestIndex: 13,
        };

        try {
            // When an update is applied for requestIndex 11 from the stale positional index 0
            PersistedRequests.update(0, newRequest, 11);

            // Then the request carrying requestIndex 11 is replaced, not the one at index 0
            expect(PersistedRequests.getAll().map((r) => r.requestIndex)).toEqual([1, 13, 12]);
            // And the replacement is logged with the resolved index
            expect(logInfoSpy).toHaveBeenCalledWith(
                '[PersistedRequests] Updating a request',
                false,
                expect.objectContaining({oldRequestIndex: 0, resolvedIndex: 1, requestIndexToReplace: 11}),
            );
        } finally {
            logInfoSpy.mockRestore();
        }
    });

    it('refuse the update and alert when two queued requests carry the same requestIndex', () => {
        // Given two live requests that share requestIndex 12, the unrelated OpenReport first, which is what a cross-tab merge produces
        const logAlertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        PersistedRequests.save({...request, data: {reportID: 'VICTIM'}, requestIndex: 12});
        PersistedRequests.save({...request, command: 'AddComment', data: {reportActionID: 'A1', reportComment: 'v1'}, requestIndex: 12});

        try {
            // When an update for requestIndex 12 is applied from the stale positional index 1
            PersistedRequests.update(1, {...request, command: 'AddComment', data: {reportActionID: 'A1', reportComment: 'v3'}, requestIndex: 13}, 12);

            // Then neither request is overwritten: the OpenReport survives and the AddComment keeps its old text instead of the edit landing on the first carrier
            expect(PersistedRequests.getAll().map((r) => r.command)).toEqual(['OpenReport', 'OpenReport', 'AddComment']);
            expect(PersistedRequests.getAll().at(1)?.data?.reportID).toBe('VICTIM');
            expect(PersistedRequests.getAll().at(2)?.data?.reportComment).toBe('v1');
            expect(PersistedRequests.getAll().map((r) => r.data?.reportComment)).toEqual([undefined, undefined, 'v1']);
            // And the ambiguity is alerted rather than resolved by guessing
            expect(logAlertSpy).toHaveBeenCalledWith(expect.stringContaining('more than one queued request'), expect.objectContaining({requestIndexToReplace: 12, staleIndex: 1}));
        } finally {
            logAlertSpy.mockRestore();
        }
    });

    it.each([
        ['a positional index that is out of range', -1, undefined],
        ['a positional index past the end of the queue', 5, undefined],
        ['a requestIndex that is no longer queued', 0, 99],
    ] as const)('do nothing and alert when asked to replace %s', (_description, oldRequestIndex, requestIndexToReplace) => {
        // Given two queued requests and no ongoing request, so the target can be in neither place
        const logAlertSpy = jest.spyOn(Log, 'alert').mockImplementation(() => {});
        PersistedRequests.save({...request, requestIndex: 11});

        try {
            // When update() is asked to replace that target
            PersistedRequests.update(oldRequestIndex, {...request, requestIndex: 12}, requestIndexToReplace);

            // Then the queue is left untouched and the dropped update is alerted, never appended
            expect(PersistedRequests.getLength()).toBe(2);
            expect(PersistedRequests.getAll().map((r) => r.requestIndex)).toEqual([1, 11]);
            expect(logAlertSpy).toHaveBeenCalledWith(expect.stringContaining('neither the queue nor the ongoing request'), expect.objectContaining({staleIndex: oldRequestIndex}));
        } finally {
            logAlertSpy.mockRestore();
        }
    });

    it('update the ongoing request with new data', () => {
        const newRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'OpenReport',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
            requestIndex: 4,
        };
        PersistedRequests.updateOngoingRequest(newRequest);
        expect(PersistedRequests.getOngoingRequest()).toEqual(newRequest);
    });

    it('updateOngoingRequest should clear persisted ongoing request when data contains a File/Blob', async () => {
        PersistedRequests.processNextRequest();
        await waitForBatchedUpdates();

        const originalFile = global.File;
        global.File = MockFile;

        try {
            const mockFile = new MockFile();
            const newRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
                command: 'OpenReport',
                successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
                failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
                requestIndex: 5,
                data: {file: mockFile},
            };

            PersistedRequests.updateOngoingRequest(newRequest);
            await waitForBatchedUpdates();

            expect(PersistedRequests.getOngoingRequest()).toEqual(newRequest);
            expect((await OnyxUtils.get(ONYXKEYS.PERSISTED_ONGOING_REQUESTS)) == null).toBe(true);
        } finally {
            global.File = originalFile;
        }
    });

    it('when removing a request should update the persistedRequests queue and clear the ongoing request', () => {
        PersistedRequests.processNextRequest();
        expect(PersistedRequests.getOngoingRequest()).toEqual(request);
        PersistedRequests.endRequestAndRemoveFromQueue(request);
        expect(PersistedRequests.getOngoingRequest()).toBeNull();
        expect(PersistedRequests.getAll().length).toBe(0);
    });
});

// Issue: https://github.com/Expensify/App/issues/80759
describe('PersistedRequests persistence guarantees', () => {
    // BUG: processNextRequest() moves the first request from the queue to
    // ongoingRequest (in-memory only). The request is only persisted to
    // PERSISTED_ONGOING_REQUESTS on disk when persistWhenOngoing is true —
    // but no production code ever sets this flag. Every write request in the
    // app uses the default (false), so ALL ongoing requests are unprotected.
    // If the app dies while a request is in-flight, the ongoing request is
    // lost from memory and has no disk backup. On restart, the deduplicate check
    // in the connect callback (PersistedRequests.ts:53-67) cannot detect
    // that this request was already being processed.
    it('Issue 3a: ongoing request should be persisted to disk (persistWhenOngoing is never set in production)', () =>
        waitForBatchedUpdates().then(() => {
            // The request from beforeEach has no persistWhenOngoing — same as every
            // write request in production. No code path ever sets it to true.
            expect(request.persistWhenOngoing).toBeUndefined();
            expect(PersistedRequests.getAll()).toHaveLength(1);

            // Move the request from queue to ongoingRequest
            PersistedRequests.processNextRequest();

            // In-memory: request is now ongoingRequest, queue is empty
            expect(PersistedRequests.getOngoingRequest()).toEqual(request);
            expect(PersistedRequests.getAll()).toHaveLength(0);

            return waitForBatchedUpdates().then(async () => {
                // FIX: processNextRequest() now always persists ongoingRequest to disk
                // via Onyx.multiSet, regardless of the persistWhenOngoing flag.
                const diskOngoing = await OnyxUtils.get(ONYXKEYS.PERSISTED_ONGOING_REQUESTS);
                expect(diskOngoing).toEqual(expect.objectContaining({command: 'OpenReport'}));
            });
        }));

    // BUG: processNextRequest() at PersistedRequests.ts:264-266 does
    // persistedRequests = persistedRequests.slice(1) but never writes the
    // updated queue back to ONYXKEYS.PERSISTED_REQUESTS via Onyx.set().
    // The disk update only happens much later when endRequestAndRemoveFromQueue()
    // is called after successful processing. Between these two points, in-memory
    // and disk are diverged — if the app crashes, the disk state is stale.
    it('Issue 3c: in-memory queue should match disk after processNextRequest()', () => {
        const requestB: Request<'reportMetadata_3' | 'reportMetadata_4'> = {
            command: 'AddComment',
            successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
            requestIndex: 2,
        };

        PersistedRequests.save(requestB);

        // Wait for both saves (beforeEach + this one) to settle on disk
        return waitForBatchedUpdates().then(() => {
            // Both requests are in memory and on disk
            expect(PersistedRequests.getAll()).toHaveLength(2);

            // processNextRequest moves first request to ongoingRequest
            PersistedRequests.processNextRequest();

            // In-memory: only requestB remains
            expect(PersistedRequests.getAll()).toHaveLength(1);

            // Read disk state directly to see what's actually persisted
            return waitForBatchedUpdates().then(async () => {
                const diskRequests = await OnyxUtils.get(ONYXKEYS.PERSISTED_REQUESTS);
                const diskArray = diskRequests ?? [];

                // FIX: processNextRequest() now persists the updated queue to disk
                // via Onyx.multiSet. Disk matches in-memory — only requestB remains.
                expect(diskArray).toHaveLength(1);
            });
        });
    });

    it('processNextRequest should keep the in-memory ongoing request when data contains a File/Blob', async () => {
        PersistedRequests.clear();
        await waitForBatchedUpdates();

        const originalFile = global.File;
        global.File = MockFile;

        try {
            const mockFile = new MockFile();
            const requestWithFile: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
                command: 'OpenReport',
                successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
                failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
                requestIndex: 30,
                data: {file: mockFile},
            };

            PersistedRequests.save(requestWithFile);
            await waitForBatchedUpdates();

            const nextRequest = PersistedRequests.processNextRequest();
            await waitForBatchedUpdates();

            expect(nextRequest).toEqual(requestWithFile);
            expect(PersistedRequests.getOngoingRequest()).toEqual(requestWithFile);
            expect((await OnyxUtils.get(ONYXKEYS.PERSISTED_ONGOING_REQUESTS)) == null).toBe(true);
        } finally {
            global.File = originalFile;
        }
    });

    // BUG: save() at PersistedRequests.ts:124-134 does a read-modify-write
    // on the in-memory array and fires Onyx.set() without awaiting. The connect
    // callback at PersistedRequests.ts:32 (persistedRequests = diskRequests)
    // blindly overwrites the in-memory state with whatever disk returns.
    // When Onyx.set() calls resolve out of order, the last callback to fire
    // wins, permanently losing any data from the overwritten write.
    it('Issue 4: rapid concurrent saves should not lose requests due to out-of-order persistence', async () => {
        // Start fresh — clear the request added by beforeEach
        PersistedRequests.clear();
        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll()).toHaveLength(0);

        // Intercept Onyx.set for PERSISTED_REQUESTS so we can control resolution order
        type CapturedSet = {triggerRealSet: () => Promise<void>};
        const capturedSets: CapturedSet[] = [];
        const originalSet = Onyx.set.bind(Onyx);
        const setMock = jest.spyOn(Onyx, 'set').mockImplementation(<TKey extends OnyxKey>(key: TKey, value: OnyxInput<TKey>) => {
            if (key === ONYXKEYS.PERSISTED_REQUESTS && Array.isArray(value) && value.length > 0) {
                return new Promise<void>((resolvePromise) => {
                    capturedSets.push({
                        triggerRealSet: () => originalSet(key, value).then(resolvePromise),
                    });
                });
            }
            return originalSet(key, value);
        });

        try {
            const requestA: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
                command: 'CommandA',
                successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
                failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
                requestIndex: 10,
            };

            const requestB: Request<'reportMetadata_3' | 'reportMetadata_4'> = {
                command: 'CommandB',
                successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
                failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
                requestIndex: 11,
            };

            // save(requestA): in-memory = [A], Onyx.set([A]) captured but not executed
            PersistedRequests.save(requestA);
            expect(PersistedRequests.getAll()).toHaveLength(1);

            // save(requestB): in-memory = [A, B], Onyx.set([A, B]) captured but not executed
            PersistedRequests.save(requestB);
            expect(PersistedRequests.getAll()).toHaveLength(2);

            // Two Onyx.set calls were captured
            expect(capturedSets).toHaveLength(2);

            // Resolve in REVERSE order to simulate out-of-order disk I/O:
            // First, resolve the second set: Onyx.set([A, B])
            await capturedSets.at(1)?.triggerRealSet();
            await waitForBatchedUpdates();

            // Connect callback fired with [A, B] — both requests present
            expect(PersistedRequests.getAll()).toHaveLength(2);

            // Now resolve the first set: Onyx.set([A]) — this is the STALE write
            await capturedSets.at(0)?.triggerRealSet();
            await waitForBatchedUpdates();

            // FIX: After initialization, the connect callback is a no-op.
            // In-memory state is authoritative and not overwritten by stale disk callbacks.
            // Both requests survive regardless of Onyx.set() resolution order.
            expect(PersistedRequests.getAll()).toHaveLength(2);
        } finally {
            setMock.mockRestore();
        }
    });

    it('Follower tab should reconcile processed requests from leader via cross-tab callback', async () => {
        PersistedRequests.clear();
        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll()).toHaveLength(0);

        const requestA: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'CommandA',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
            requestIndex: 20,
        };
        const requestB: Request<'reportMetadata_3' | 'reportMetadata_4'> = {
            command: 'CommandB',
            successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
            requestIndex: 21,
        };

        PersistedRequests.save(requestA);
        PersistedRequests.save(requestB);
        await waitForBatchedUpdates();
        expect(PersistedRequests.getAll()).toHaveLength(2);

        // Reset the pending write counter before simulating a cross-tab event.
        // In production, cross-tab updates arrive via storage events which are
        // independent of Onyx.set promise timing, so the counter is always 0.
        // In tests, promise resolution timing is unpredictable relative to
        // Onyx callbacks, so we reset explicitly.
        PersistedRequests.resetPendingWritesForTest();

        // Simulate a cross-tab callback: leader processed requestA and removed it.
        await Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, [requestB]);
        await waitForBatchedUpdates();

        // The follower should have reconciled: requestA removed from memory
        expect(PersistedRequests.getAll()).toHaveLength(1);
        expect(PersistedRequests.getAll().at(0)).toEqual(requestB);

        // Save a new request — it should NOT re-add requestA to disk
        const requestC: Request<'reportMetadata_5' | 'reportMetadata_6'> = {
            command: 'CommandC',
            successData: [{key: 'reportMetadata_5', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_6', onyxMethod: 'merge', value: {}}],
            requestIndex: 22,
        };
        PersistedRequests.save(requestC);
        await waitForBatchedUpdates();

        expect(PersistedRequests.getAll()).toHaveLength(2);
        expect(PersistedRequests.getAll().map((r) => r.command)).toEqual(['CommandB', 'CommandC']);
    });
});
