import {resolveDuplicationConflictAction, resolveReconnectDuplicationConflictAction} from '@libs/actions/RequestConflictUtils';
import * as NetworkState from '@libs/NetworkState';

import {clear as clearPersistedRequests, getAll, getLength, getOngoingRequest, updateOngoingRequest} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type Request from '../../src/types/onyx/Request';
import type {AnyRequest, ConflictActionData} from '../../src/types/onyx/Request';
import type {MockFetch} from '../utils/TestHelper';

import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as RequestModule from '../../src/libs/Request';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const request: Request<'userMetadata'> = {
    command: 'ReconnectApp',
    successData: [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}],
    failureData: [{key: 'userMetadata', onyxMethod: 'set', value: {}}],
};
let mockFetch: MockFetch;
beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
    });
});
beforeEach(() => {
    mockFetch = TestHelper.createGlobalFetchMock();
    global.fetch = mockFetch;
    return Onyx.clear()
        .then(() => SequentialQueue.clearQueueFlushedData())
        .then(waitForBatchedUpdates);
});
describe('SequentialQueue', () => {
    it('should push one request and persist one', () => {
        SequentialQueue.push(request);
        expect(getLength()).toBe(1);
    });

    it('should push two requests and persist two', () => {
        SequentialQueue.push(request);
        SequentialQueue.push(request);
        expect(getLength()).toBe(2);
    });

    it('should resolve waitForIdle without flushing when the network goes offline during persist', async () => {
        // push()'s sync prelude marks isReadyPromise pending while online, then awaits the disk
        // write. If the network flips offline during that await, flush() would early-return on its
        // offline guard without resolving isReadyPromise — leaving waitForIdle() (READs) hung until
        // an unrelated reconnect. push() must instead resolve isReadyPromise and skip flushing.
        const offlineSpy = jest.spyOn(NetworkState, 'getIsOffline').mockReturnValue(false);
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        try {
            // Kick off the push while "online": the synchronous prelude runs up to `await persistencePromise`.
            const pushPromise = SequentialQueue.push(request);

            // Flip offline while the awaited disk write is still pending.
            offlineSpy.mockReturnValue(true);

            await pushPromise;

            // The request is still persisted — not flushed, not dropped.
            expect(getLength()).toBe(1);

            // waitForIdle() must resolve rather than hang.
            const idleOrTimeout = await Promise.race([
                SequentialQueue.waitForIdle().then(() => 'resolved' as const),
                new Promise<'timeout'>((resolve) => {
                    timeoutId = setTimeout(() => resolve('timeout'), 1000);
                }),
            ]);
            expect(idleOrTimeout).toBe('resolved');
        } finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            offlineSpy.mockRestore();
        }
    });

    it('should not block the queue when a disk write fails during persist', async () => {
        // If a conflict-resolution disk write rejects (storage full / corruption), push() must not throw
        // or strand isReadyPromise — the request should still flush and waitForIdle() should resolve.
        const originalSet = Onyx.set.bind(Onyx);

        mockFetch.pause();
        try {
            await SequentialQueue.push({command: 'OpenReport'}); // occupies ongoingRequest
            await waitForBatchedUpdates();
            await SequentialQueue.push(request); // ReconnectApp stacks in the queue

            // Fail the conflict-resolution persist (a raw Onyx.set on the persisted-requests key).
            const setMock = jest
                .spyOn(Onyx, 'set')
                .mockImplementation((key, value) => (key === ONYXKEYS.PERSISTED_REQUESTS ? Promise.reject(new Error('simulated disk-write failure')) : originalSet(key, value)));
            try {
                const replacing: Request<never> = {
                    command: 'ReconnectApp',
                    data: {accountID: 56789},
                    checkAndFixConflictingRequest: (persistedRequests) => {
                        const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
                        return {conflictAction: index === -1 ? {type: 'push'} : {type: 'replace', index}};
                    },
                };
                // The failed disk write must not reject the caller.
                await expect(SequentialQueue.push(replacing)).resolves.toBeUndefined();
            } finally {
                setMock.mockRestore();
            }
        } finally {
            await mockFetch.resume();
        }

        // The queue still drains and READs unblock — a hang here would fail the test by timing out.
        await SequentialQueue.waitForIdle();
        expect(getLength()).toBe(0);
    });

    it('should push two requests with conflict resolution and replace', async () => {
        // Pause the queue so `process()` does not consume the first request before
        // the conflict resolver runs. Under persist-before-fire `push()` is async,
        // so we await both pushes and then assert on the on-disk queue directly.
        SequentialQueue.pause();
        try {
            await SequentialQueue.push(request);
            const requestWithConflictResolution: Request<never> = {
                command: 'ReconnectApp',
                data: {accountID: 56789},
                checkAndFixConflictingRequest: (persistedRequests) => {
                    const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
                    if (index === -1) {
                        return {conflictAction: {type: 'push'}};
                    }
                    return {conflictAction: {type: 'replace', index}};
                },
            };
            await SequentialQueue.push(requestWithConflictResolution);
            expect(getLength()).toBe(1);
            expect(getAll().at(0)?.data?.accountID).toBe(56789);
        } finally {
            SequentialQueue.unpause();
        }
    });

    it('should push two requests with conflict resolution and push', () => {
        SequentialQueue.push(request);
        const requestWithConflictResolution: Request<never> = {
            command: 'ReconnectApp',
            data: {accountID: 56789},
            checkAndFixConflictingRequest: () => {
                return {conflictAction: {type: 'push'}};
            },
        };
        SequentialQueue.push(requestWithConflictResolution);
        expect(getLength()).toBe(2);
    });

    it('should push two requests with conflict resolution and noAction', () => {
        SequentialQueue.push(request);
        const requestWithConflictResolution: Request<never> = {
            command: 'ReconnectApp',
            data: {accountID: 56789},
            checkAndFixConflictingRequest: () => {
                return {conflictAction: {type: 'noAction'}};
            },
        };
        SequentialQueue.push(requestWithConflictResolution);
        expect(getLength()).toBe(1);
    });

    it('should add a new request even if a similar one is ongoing', async () => {
        // Pause fetch so the first request lands as `ongoingRequest` but never completes.
        // The conflict checker on push 2 inspects the persisted queue (which excludes the
        // ongoing request), so it cannot find a 'ReconnectApp' to replace and falls back
        // to 'push'. The new request is therefore added to the queue.
        mockFetch.pause();
        try {
            await SequentialQueue.push(request);
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('ReconnectApp');

            const requestWithConflictResolution: Request<never> = {
                command: 'ReconnectApp',
                data: {accountID: 56789},
                checkAndFixConflictingRequest: (persistedRequests) => {
                    const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
                    if (index === -1) {
                        return {conflictAction: {type: 'push'}};
                    }
                    return {conflictAction: {type: 'replace', index}};
                },
            };

            await SequentialQueue.push(requestWithConflictResolution);

            // The new request is in the persisted queue with the expected accountID.
            expect(getAll().some((r) => r.data?.accountID === 56789)).toBe(true);
        } finally {
            await mockFetch.resume();
        }
    });

    it('should replace request in queue while a similar one is ongoing', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(request);
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('ReconnectApp');

            const conflictResolver = <TKey extends OnyxKey>(persistedRequests: Array<Request<TKey>>): ConflictActionData => {
                const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
                if (index === -1) {
                    return {conflictAction: {type: 'push'}};
                }
                return {conflictAction: {type: 'replace', index}};
            };

            const requestWithConflictResolution: Request<never> = {
                command: 'ReconnectApp',
                data: {accountID: 56789},
                checkAndFixConflictingRequest: conflictResolver,
            };

            const requestWithConflictResolution2: Request<never> = {
                command: 'ReconnectApp',
                data: {accountID: 56789},
                checkAndFixConflictingRequest: conflictResolver,
            };

            // First conflict push: queue is empty (ongoing not in queue) → push action → queue=[r2].
            // Second conflict push: queue=[r2] → replace at 0 → queue=[r3].
            // Total in-flight items: ongoing + queue = 2.
            await SequentialQueue.push(requestWithConflictResolution);
            await SequentialQueue.push(requestWithConflictResolution2);

            expect(getLength()).toBe(2);
        } finally {
            await mockFetch.resume();
        }
    });

    it('should replace request in queue while a similar one is ongoing and keep the same index', async () => {
        mockFetch.pause();
        try {
            // First push moves into `ongoingRequest`; subsequent pushes stack in the queue.
            await SequentialQueue.push({command: 'OpenReport'});
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('OpenReport');

            await SequentialQueue.push(request);

            const requestWithConflictResolution: Request<never> = {
                command: 'ReconnectApp',
                data: {accountID: 56789},
                checkAndFixConflictingRequest: (persistedRequests) => {
                    const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
                    if (index === -1) {
                        return {conflictAction: {type: 'push'}};
                    }
                    return {conflictAction: {type: 'replace', index}};
                },
            };

            await SequentialQueue.push(requestWithConflictResolution);
            await SequentialQueue.push({command: 'AddComment'});
            await SequentialQueue.push({command: 'OpenReport'});

            expect(getLength()).toBe(4);
            const persistedRequests = getAll();
            expect(getOngoingRequest()?.command).toBe('OpenReport');
            expect(persistedRequests.at(0)?.data?.accountID).toBe(56789);
        } finally {
            await mockFetch.resume();
        }
    });

    // need to test a race condition between processing the next request and then pushing a new request with conflict resolver
    it('should resolve the conflict and replace the correct request in the queue while a new request is picked up after unpausing', async () => {
        SequentialQueue.pause();
        for (let i = 0; i < 5; i++) {
            SequentialQueue.push({command: `OpenReport${i}`});
            SequentialQueue.push({command: `AddComment${i}`});
        }
        SequentialQueue.push(request);
        SequentialQueue.push({command: 'AddComment6'});
        SequentialQueue.push({command: 'OpenReport6'});
        // wait for Onyx.connect execute the callback and start processing the queue
        await Promise.resolve();
        const requestWithConflictResolution: Request<never> = {
            command: 'ReconnectApp-replaced',
            data: {accountID: 56789},
            checkAndFixConflictingRequest: (persistedRequests) => {
                // should be one instance of ReconnectApp, get the index to replace it later
                const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
                if (index === -1) {
                    return {conflictAction: {type: 'push'}};
                }

                return {
                    conflictAction: {type: 'replace', index},
                };
            },
        };

        Promise.resolve().then(() => {
            SequentialQueue.unpause();
        });
        Promise.resolve().then(() => {
            SequentialQueue.push(requestWithConflictResolution);
        });

        await Promise.resolve();
        await Promise.resolve();
        const persistedRequests = getAll();

        // We know ReconnectApp is at index 9 in the queue, so we can get it to verify
        // that was replaced by the new request.
        expect(persistedRequests.at(9)?.command).toBe('ReconnectApp-replaced');
        expect(persistedRequests.at(9)?.data?.accountID).toBe(56789);
    });

    // I need to test now when moving the request from the queue to the ongoing request the PERSISTED_REQUESTS is decreased and PERSISTED_ONGOING_REQUESTS has the new request
    it('should move the request from the queue to the ongoing request and save it into Onyx', () => {
        const persistedRequest = {...request, persistWhenOngoing: true, initiatedOffline: false};
        SequentialQueue.push(persistedRequest);

        const connectionId = Onyx.connect<typeof ONYXKEYS.PERSISTED_ONGOING_REQUESTS>({
            key: ONYXKEYS.PERSISTED_ONGOING_REQUESTS,
            callback: (ongoingRequest) => {
                if (!ongoingRequest) {
                    return;
                }

                Onyx.disconnect(connectionId);
                expect(ongoingRequest).toEqual(persistedRequest);
                expect(ongoingRequest).toEqual(getOngoingRequest());
                expect(getAll().length).toBe(0);
            },
        });
    });

    it('should get the ongoing request from onyx and start processing it', async () => {
        const persistedRequest = {...request, persistWhenOngoing: true, initiatedOffline: false};
        Onyx.set<typeof ONYXKEYS.PERSISTED_ONGOING_REQUESTS>(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, persistedRequest as AnyRequest);
        SequentialQueue.push({command: 'OpenReport'});

        await Promise.resolve();

        expect(persistedRequest).toEqual(getOngoingRequest());
        expect(getAll().length).toBe(1);
    });

    it('should not flush queueFlushedData while an ongoing request still exists', async () => {
        const persistedRequest = {...request, persistWhenOngoing: true, initiatedOffline: false};
        const flushedUpdate: OnyxUpdate<typeof ONYXKEYS.USER_METADATA> = {key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}};

        updateOngoingRequest(persistedRequest as AnyRequest);
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: true});
        await SequentialQueue.saveQueueFlushedData(flushedUpdate);
        await waitForBatchedUpdates();

        SequentialQueue.flush();
        await Promise.resolve();
        await waitForBatchedUpdates();
        expect(SequentialQueue.getQueueFlushedData()).toEqual([flushedUpdate]);
    });

    it('should treat a request as success and drain it without retry when the server says the record already exists', async () => {
        await Onyx.set(ONYXKEYS.NETWORK, {shouldFailAllRequests: false, shouldForceOffline: false});
        await clearPersistedRequests();
        await waitForBatchedUpdates();

        const processSpy = jest.spyOn(RequestModule, 'processWithMiddleware').mockRejectedValue(new Error(CONST.ERROR.ALREADY_CREATED));
        const onyxUpdateSpy = jest.spyOn(Onyx, 'update');

        const successData: Array<OnyxUpdate<typeof ONYXKEYS.USER_METADATA>> = [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 9999}}];
        const failureData: Array<OnyxUpdate<typeof ONYXKEYS.USER_METADATA>> = [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1}}];

        try {
            SequentialQueue.push({command: 'ReconnectApp', successData, failureData});
            await Promise.resolve();
            await waitForBatchedUpdates();

            expect(processSpy).toHaveBeenCalledTimes(1);
            expect(getAll().length).toBe(0);

            const dispatchedSuccess = onyxUpdateSpy.mock.calls.some((args) => {
                const updates = args.at(0) as unknown[] | undefined;
                return Array.isArray(updates) && updates.includes(successData.at(0));
            });
            expect(dispatchedSuccess).toBe(true);

            const dispatchedFailure = onyxUpdateSpy.mock.calls.some((args) => {
                const updates = args.at(0) as unknown[] | undefined;
                return Array.isArray(updates) && updates.includes(failureData.at(0));
            });
            expect(dispatchedFailure).toBe(false);
        } finally {
            processSpy.mockRestore();
            onyxUpdateSpy.mockRestore();
        }
    });
});

describe('SequentialQueue - reconnect coverage collapse', () => {
    // Build a ReconnectApp wired to the real resolver exactly as API.writeWithNoDuplicatesReconnectConflictAction
    // does, so these tests exercise the wiring, not a stand-in matcher. getOngoingRequest() is read inside the
    // closure (both eval passes agree).
    function makeReconnectRequest<TKey extends OnyxKey = never>(overrides: {command: 'ReconnectApp'; data?: Record<string, unknown>} & Partial<Request<TKey>>): Request<TKey> {
        const incoming: AnyRequest = {command: overrides.command, data: overrides.data};
        return {
            ...overrides,
            checkAndFixConflictingRequest: (persistedRequests) => resolveReconnectDuplicationConflictAction(persistedRequests as AnyRequest[], getOngoingRequest(), incoming),
        } as Request<TKey>;
    }

    // Build an OpenApp wired exactly as API.writeWithNoDuplicatesConflictAction(OPEN_APP) does: the generic
    // resolver dedupes by command against the waiting queue only and never reads the in-flight request.
    function makeOpenAppRequest<TKey extends OnyxKey = never>(overrides: {data?: Record<string, unknown>} & Partial<Request<TKey>> = {}): Request<TKey> {
        return {
            ...overrides,
            command: 'OpenApp',
            checkAndFixConflictingRequest: (persistedRequests) => resolveDuplicationConflictAction(persistedRequests as AnyRequest[], (queued) => queued.command === 'OpenApp'),
        } as Request<TKey>;
    }

    it('drops an identical reconnect enqueued while one is in flight, leaving only one on the wire', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp'}));
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('ReconnectApp');

            // An identical full reconnect lands mid-flight. It is fully covered, so it is dropped.
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp'}));

            // Only the in-flight request remains; nothing was added to the waiting queue.
            expect(getLength()).toBe(1);
            expect(getAll()).toHaveLength(0);
        } finally {
            await mockFetch.resume();
        }
    });

    it('keeps a full reconnect that arrives while only an incremental one is in flight (no data lost)', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp', data: {updateIDFrom: 500}}));
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.data?.updateIDFrom).toBe(500);

            // A full reconnect re-fetches more than the in-flight incremental one, so it must run after.
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp'}));

            expect(getLength()).toBe(2);
            expect(getAll().at(0)?.data?.updateIDFrom).toBeUndefined();
        } finally {
            await mockFetch.resume();
        }
    });

    it('does not collapse an unrelated command enqueued during an in-flight reconnect', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp'}));
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('ReconnectApp');

            await SequentialQueue.push({command: 'AddComment', data: {reportActionID: '1'}});

            expect(getLength()).toBe(2);
            expect(getAll().some((r) => r.command === 'AddComment')).toBe(true);
        } finally {
            await mockFetch.resume();
        }
    });

    it('drops an incoming incremental reconnect rather than clobbering a waiting full reconnect (under-fetch fix)', async () => {
        // The generic resolver would `replace` the waiting full reconnect with the newer incremental one,
        // silently narrowing coverage. The reconnect resolver drops the incremental and keeps the full.
        SequentialQueue.pause();
        try {
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp'}));
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp', data: {updateIDFrom: 500}}));

            expect(getLength()).toBe(1);
            expect(getAll().at(0)?.data?.updateIDFrom).toBeUndefined();
        } finally {
            SequentialQueue.unpause();
        }
    });

    it('clears IS_LOADING_REPORT_DATA after a dropped duplicate, once the in-flight reconnect finishes', async () => {
        const onyxData = {
            optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.IS_LOADING_REPORT_DATA, value: true}] as Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_REPORT_DATA>>,
            finallyData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.IS_LOADING_REPORT_DATA, value: false}] as Array<OnyxUpdate<typeof ONYXKEYS.IS_LOADING_REPORT_DATA>>,
        };
        let isLoadingReportData: boolean | undefined;
        const connectionID = Onyx.connect({
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            callback: (value) => {
                isLoadingReportData = value;
            },
        });

        try {
            mockFetch.pause();
            await SequentialQueue.push(makeReconnectRequest<typeof ONYXKEYS.IS_LOADING_REPORT_DATA>({command: 'ReconnectApp', ...onyxData}));
            await waitForBatchedUpdates();
            await SequentialQueue.push(makeReconnectRequest<typeof ONYXKEYS.IS_LOADING_REPORT_DATA>({command: 'ReconnectApp', ...onyxData}));
            expect(getLength()).toBe(1);
            await mockFetch.resume();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            // The in-flight cycle owns the shared flag; its finallyData clears the spinner even under the drop.
            expect(isLoadingReportData).toBe(false);
        } finally {
            Onyx.disconnect(connectionID);
        }
    });

    it('keeps an incoming OpenApp that arrives while a reconnect is in flight (HAS_LOADED_APP path is preserved)', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(makeReconnectRequest({command: 'ReconnectApp'}));
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('ReconnectApp');

            // OpenApp dedupes against the waiting queue only, never the in-flight request, so an OpenApp that
            // lands mid-reconnect still runs and its preservation writes are never dropped.
            await SequentialQueue.push(makeOpenAppRequest());

            expect(getLength()).toBe(2);
            expect(getAll().at(0)?.command).toBe('OpenApp');
        } finally {
            await mockFetch.resume();
        }
    });

    // The failure→retry→no-loss story (a dropped duplicate is a subset of the durable, retryable in-flight
    // request) rests on the queue's existing retry/backoff, which is exercised in tests/unit/APITest.ts.
});

describe('SequentialQueue - QueueFlushedData', () => {
    it('should add to queueFlushedData', async () => {
        const updates: Array<OnyxUpdate<typeof ONYXKEYS.USER_METADATA>> = [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}];
        await SequentialQueue.saveQueueFlushedData(...updates);
        expect(SequentialQueue.getQueueFlushedData()).toEqual([{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}]);
    });
    it('should clear queueFlushedData', async () => {
        const updates: Array<OnyxUpdate<typeof ONYXKEYS.USER_METADATA>> = [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}];
        await SequentialQueue.saveQueueFlushedData(...updates);
        await SequentialQueue.clearQueueFlushedData();
        expect(SequentialQueue.getQueueFlushedData()).toEqual([]);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Pushes an OpenApp request carrying queueFlushedData, with processWithMiddleware mocked to resolve with the given jsonCode.
    async function pushOpenAppAndWaitForIdle(jsonCode: number) {
        await Onyx.set(ONYXKEYS.NETWORK, {shouldFailAllRequests: false, shouldForceOffline: false});
        await clearPersistedRequests();
        await waitForBatchedUpdates();

        const flushedUpdate: OnyxUpdate<typeof ONYXKEYS.HAS_LOADED_APP> = {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.HAS_LOADED_APP, value: true};
        jest.spyOn(RequestModule, 'processWithMiddleware').mockResolvedValue({jsonCode});
        SequentialQueue.push({command: 'OpenApp', queueFlushedData: [flushedUpdate]});
        await SequentialQueue.waitForIdle();
        await waitForBatchedUpdates();
    }

    it('does not commit queueFlushedData when the resolved response is not a 200', async () => {
        await pushOpenAppAndWaitForIdle(CONST.JSON_CODE.BAD_REQUEST);

        // A failed-but-resolved OpenApp must not stage HAS_LOADED_APP, or the next boot runs ReconnectApp only and can't self-heal.
        expect(SequentialQueue.getQueueFlushedData()).toEqual([]);
        expect(await getOnyxValue(ONYXKEYS.HAS_LOADED_APP)).toBeFalsy();
    });

    it('commits queueFlushedData when the resolved response is a 200', async () => {
        await pushOpenAppAndWaitForIdle(CONST.JSON_CODE.SUCCESS);

        expect(await getOnyxValue(ONYXKEYS.HAS_LOADED_APP)).toBe(true);
    });
});
