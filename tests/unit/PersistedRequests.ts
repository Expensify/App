import Onyx from 'react-native-onyx';
import type {OnyxKey} from 'react-native-onyx';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import ONYXKEYS from '../../src/ONYXKEYS';
import type Request from '../../src/types/onyx/Request';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const request: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
    command: 'OpenReport',
    successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
    failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
    requestID: 1,
};

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
            requestID: 2,
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
            requestID: 3,
        };
        PersistedRequests.update(0, newRequest);
        expect(PersistedRequests.getAll().at(0)).toEqual(newRequest);
    });

    it('update the ongoing request with new data', () => {
        const newRequest: Request<'reportMetadata_1' | 'reportMetadata_2'> = {
            command: 'OpenReport',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
            requestID: 4,
        };
        PersistedRequests.updateOngoingRequest(newRequest);
        expect(PersistedRequests.getOngoingRequest()).toEqual(newRequest);
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

            // Spy on Onyx.set AFTER beforeEach has settled to avoid capturing setup calls
            const setMock = jest.spyOn(Onyx, 'set');

            // Move the request from queue to ongoingRequest
            PersistedRequests.processNextRequest();

            // In-memory: request is now ongoingRequest, queue is empty
            expect(PersistedRequests.getOngoingRequest()).toEqual(request);
            expect(PersistedRequests.getAll()).toHaveLength(0);

            return waitForBatchedUpdates()
                .then(() => {
                    // BUG: Onyx.set was never called for PERSISTED_ONGOING_REQUESTS
                    // because persistWhenOngoing is undefined (PersistedRequests.ts:273).
                    // The ongoing request exists only in memory — no disk backup.
                    // When fixed, this should persist ALL ongoing requests regardless
                    // of the persistWhenOngoing flag. Change to:
                    //   expect(setMock).toHaveBeenCalledWith(
                    //     ONYXKEYS.PERSISTED_ONGOING_REQUESTS,
                    //     expect.objectContaining({command: 'OpenReport'}),
                    //   );
                    expect(setMock).not.toHaveBeenCalledWith(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, expect.objectContaining({command: 'OpenReport'}));
                })
                .finally(() => {
                    setMock.mockRestore();
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
            requestID: 2,
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

            // Read disk state via a fresh Onyx connection to see what's actually persisted
            return new Promise<void>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: ONYXKEYS.PERSISTED_REQUESTS,
                    reuseConnection: false,
                    callback: (diskRequests) => {
                        Onyx.disconnect(connection);
                        const diskArray = diskRequests ?? [];

                        // BUG: processNextRequest() updates in-memory immediately but does NOT
                        // write the updated queue back to ONYXKEYS.PERSISTED_REQUESTS.
                        // In-memory has [requestB] but disk still has [request, requestB].
                        // When fixed, disk should match in-memory.
                        // Change to: expect(diskArray).toHaveLength(1);
                        expect(diskArray).toHaveLength(2);

                        resolve();
                    },
                });
            });
        });
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
        type CapturedSet = {value: unknown; triggerRealSet: () => Promise<void>};
        const capturedSets: CapturedSet[] = [];
        const originalSet = Onyx.set.bind(Onyx);
        const setMock = jest.spyOn(Onyx, 'set').mockImplementation((key, value) => {
            if (key === ONYXKEYS.PERSISTED_REQUESTS && Array.isArray(value) && value.length > 0) {
                return new Promise<void>((resolvePromise) => {
                    capturedSets.push({
                        value,
                        triggerRealSet: () => originalSet(key, value as Array<Request<OnyxKey>>).then(resolvePromise),
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
                requestID: 10,
            };

            const requestB: Request<'reportMetadata_3' | 'reportMetadata_4'> = {
                command: 'CommandB',
                successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
                failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
                requestID: 11,
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

            // BUG: The connect callback at PersistedRequests.ts:32 blindly overwrites
            // in-memory state with whatever disk returns. The stale Onyx.set([A])
            // resolved last, so the callback received [A] and overwrote [A, B].
            // requestB is permanently lost.
            // When fixed, both requests should survive regardless of resolution order.
            // Change to: expect(PersistedRequests.getAll()).toHaveLength(2);
            expect(PersistedRequests.getAll()).toHaveLength(1);
        } finally {
            setMock.mockRestore();
        }
    });
});
