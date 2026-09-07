import {resolveOpenAppDuplicationConflictAction, resolveReconnectDuplicationConflictAction} from '@libs/actions/RequestConflictUtils';
import {isClientTheLeader} from '@libs/ActiveClientManager';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as NetworkState from '@libs/NetworkState';

import {clear as clearPersistedRequests, getAll, getLength, getOngoingRequest, updateOngoingRequest} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type Request from '../../src/types/onyx/Request';
import type {AnyRequest, ConflictActionData} from '../../src/types/onyx/Request';
import type Response from '../../src/types/onyx/Response';
import type {MockFetch} from '../utils/TestHelper';

import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import * as RequestModule from '../../src/libs/Request';
import getOnyxValue from '../utils/getOnyxValue';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/ActiveClientManager', () => ({
    isClientTheLeader: jest.fn(() => true),
    isReady: jest.fn(() => Promise.resolve()),
    init: jest.fn(),
}));
const mockedIsClientTheLeader = jest.mocked(isClientTheLeader);

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

    it('should reset the shared throttle when the queue stops because the app went offline', async () => {
        const offlineSpy = jest.spyOn(NetworkState, 'getIsOffline').mockReturnValue(false);
        mockFetch.mockRejectedValue(new Error(CONST.ERROR.FAILED_TO_FETCH));

        try {
            await SequentialQueue.push(request);
            await waitForBatchedUpdates();

            // The request failed once, so the throttle is now carrying a retry count and a wait time.
            const scheduledWait = SequentialQueue.sequentialQueueRequestThrottle.getLastRequestWaitTime();
            expect(scheduledWait).toBeGreaterThan(0);

            // Go offline while the retry is still sleeping. When it wakes, process() stops on its offline guard.
            offlineSpy.mockReturnValue(true);
            await new Promise((resolve) => {
                setTimeout(resolve, scheduledWait + 10);
            });

            // The next command must start from a fresh count and a floor-range wait rather than inherit this one.
            expect(SequentialQueue.sequentialQueueRequestThrottle.getLastRequestWaitTime()).toBe(0);
        } finally {
            offlineSpy.mockRestore();
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

    // Build an OpenApp wired as API.writeWithNoDuplicatesOpenAppConflictAction does.
    function makeOpenAppRequest<TKey extends OnyxKey = never>(shouldDedupeWithInFlight = true): Request<TKey> {
        return {
            command: 'OpenApp',
            checkAndFixConflictingRequest: (persistedRequests) => resolveOpenAppDuplicationConflictAction(persistedRequests as AnyRequest[], getOngoingRequest(), shouldDedupeWithInFlight),
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

            // A reconnect does not carry OpenApp's payload, so it never covers an incoming OpenApp.
            await SequentialQueue.push(makeOpenAppRequest());

            expect(getLength()).toBe(2);
            expect(getAll().at(0)?.command).toBe('OpenApp');
        } finally {
            await mockFetch.resume();
        }
    });

    it('drops an incoming OpenApp enqueued while one is in flight, leaving only one full download on the wire', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(makeOpenAppRequest());
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('OpenApp');

            await SequentialQueue.push(makeOpenAppRequest());

            expect(getLength()).toBe(1);
            expect(getAll()).toHaveLength(0);
        } finally {
            await mockFetch.resume();
        }
    });

    it('keeps an incoming OpenApp that opted out of the dedupe while one is in flight', async () => {
        mockFetch.pause();
        try {
            await SequentialQueue.push(makeOpenAppRequest());
            await waitForBatchedUpdates();
            expect(getOngoingRequest()?.command).toBe('OpenApp');

            // The priority-mode refetch opts out: identical params, but the in-flight response is the old report set.
            await SequentialQueue.push(makeOpenAppRequest(false));

            expect(getLength()).toBe(2);
            expect(getAll().at(0)?.command).toBe('OpenApp');
        } finally {
            await mockFetch.resume();
        }
    });

    // The failure→retry→no-loss story (a dropped duplicate is a subset of the durable, retryable in-flight
    // request) rests on the queue's existing retry/backoff, which is exercised in tests/unit/APITest.ts.
});

describe('SequentialQueue - offline read reconciliation', () => {
    const reportID = '123456';
    const reportActionID = 'own-comment-1';
    const otherUserActionID = 'other-user-comment-1';

    /**
     * Fakes the network: an offline AddComment returns a server time for our own action, everything else returns
     * empty. `otherActionCreated` adds another user's action to the same response. Also records the lastReadTime
     * the queue sends for the read.
     */
    function mockProcessWithMiddleware(commentServerTime: string | undefined, otherActionCreated?: string) {
        const capture: {readLastReadTime?: string} = {};
        const mockImpl = (mockedRequest: AnyRequest): Promise<Response<OnyxKey> | void> => {
            if (mockedRequest.command === WRITE_COMMANDS.ADD_COMMENT && commentServerTime !== undefined) {
                const reportActionsValue: Record<string, {created: string}> = {[reportActionID]: {created: commentServerTime}};
                if (otherActionCreated !== undefined) {
                    reportActionsValue[otherUserActionID] = {created: otherActionCreated};
                }
                return Promise.resolve({
                    onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, value: reportActionsValue}],
                });
            }
            if (mockedRequest.command === WRITE_COMMANDS.READ_NEWEST_ACTION) {
                capture.readLastReadTime = typeof mockedRequest.data?.lastReadTime === 'string' ? mockedRequest.data.lastReadTime : undefined;
            }
            return Promise.resolve();
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the mock only needs command and data, so skip the generic signature
        const spy = jest.spyOn(RequestModule, 'processWithMiddleware').mockImplementation(mockImpl as typeof RequestModule.processWithMiddleware);
        return {spy, capture};
    }

    const buildComment = (): AnyRequest => ({command: WRITE_COMMANDS.ADD_COMMENT, data: {reportID, reportActionID}, initiatedOffline: true});
    const buildRead = (lastReadTime: string): AnyRequest => ({command: WRITE_COMMANDS.READ_NEWEST_ACTION, data: {reportID, lastReadTime}, initiatedOffline: true});

    let offlineSpy: jest.SpyInstance;
    beforeEach(() => {
        // This only runs while the queue drains after reconnecting, so keep the queue unblocked.
        offlineSpy = jest.spyOn(NetworkState, 'getIsOffline').mockReturnValue(false);
    });
    afterEach(() => {
        offlineSpy.mockRestore();
    });

    it('bumps a following offline ReadNewestAction forward to the offline comment server time', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const commentServerTime = '2026-01-01 10:00:00.000';
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildComment());
            await SequentialQueue.push(buildRead(staleReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(capture.readLastReadTime).toBe(commentServerTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('mirrors the bump into Onyx so the origin device also sees the report as read, not just the outgoing request', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const commentServerTime = '2026-01-01 10:00:00.000';
        const {spy: processSpy} = mockProcessWithMiddleware(commentServerTime);
        try {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID, lastReadTime: staleReadTime});
            await waitForBatchedUpdates();

            SequentialQueue.pause();
            await SequentialQueue.push(buildComment());
            await SequentialQueue.push(buildRead(staleReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            const report = await new Promise<{lastReadTime?: string} | undefined>((resolve) => {
                const connectionID = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    callback: (value) => {
                        Onyx.disconnect(connectionID);
                        resolve(value);
                    },
                });
            });

            expect(report?.lastReadTime).toBe(commentServerTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('never moves a ReadNewestAction backward when the read already covers a newer time than the comment', async () => {
        const commentServerTime = '2026-01-01 09:00:00.000';
        const newerReadTime = '2026-01-01 11:00:00.000';
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildComment());
            await SequentialQueue.push(buildRead(newerReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            // The remembered time is older, so the read keeps its own newer time.
            expect(capture.readLastReadTime).toBe(newerReadTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('does not bump the read when the report had no offline comment, so a later message from another user stays unread', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        // No comment is sent, so there is nothing to remember for this report.
        const {spy: processSpy, capture} = mockProcessWithMiddleware(undefined);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildRead(staleReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(capture.readLastReadTime).toBe(staleReadTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('ignores a later timestamp from another user action in the same response, bumping only to its own comment time', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const ownCommentServerTime = '2026-01-01 10:00:00.000';
        // Another user's message landed after ours, in the same response.
        const otherUserServerTime = '2026-01-01 12:00:00.000';
        const {spy: processSpy, capture} = mockProcessWithMiddleware(ownCommentServerTime, otherUserServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildComment());
            await SequentialQueue.push(buildRead(staleReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            // Uses our own comment's time, not the other user's later one.
            expect(capture.readLastReadTime).toBe(ownCommentServerTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('does not leak a recorded comment time across queue flushes (map is cleared on drain)', async () => {
        const commentServerTime = '2026-01-01 12:00:00.000';
        const earlierReadTime = '2026-01-01 08:00:00.000';
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            // First run: a comment with no read after it. The remembered time must be dropped.
            await SequentialQueue.push(buildComment());
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            // Second run: an earlier read time, which a leftover value would wrongly move forward.
            await SequentialQueue.push(buildRead(earlierReadTime));
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(capture.readLastReadTime).toBe(earlierReadTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('does not bump a read whose report only has offline comments from a different report', async () => {
        const staleReadTime = '2026-01-01 09:00:00.000';
        const commentServerTime = '2026-01-01 10:00:00.000';
        const otherReportComment: AnyRequest = {command: WRITE_COMMANDS.ADD_COMMENT, data: {reportID: '999999', reportActionID: 'other-report-comment-1'}, initiatedOffline: true};
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(otherReportComment);
            await SequentialQueue.push(buildRead(staleReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            // Times are remembered per report, so another report's comment must not change this read.
            expect(capture.readLastReadTime).toBe(staleReadTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('does not bump the read while a same-report MarkAsUnread is still queued, so the explicit unread survives', async () => {
        // MarkAsUnread runs last and wins, and it already set the older time in Onyx.
        const staleReadTime = '2026-01-01 09:00:00.000';
        const commentServerTime = '2026-01-01 10:00:00.000';
        const markAsUnread: AnyRequest = {command: WRITE_COMMANDS.MARK_AS_UNREAD, data: {reportID, lastReadTime: '2026-01-01 08:00:00.000'}, initiatedOffline: true};
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildComment());
            await SequentialQueue.push(buildRead(staleReadTime));
            await SequentialQueue.push(markAsUnread);
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(capture.readLastReadTime).toBe(staleReadTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('documents a known boundary: a read already queued ahead of the offline comment is not bumped', async () => {
        // readNewestAction replaces a queued read in place, so this read stays ahead of the comment and we
        // learn its time too late. Left as today's behavior on purpose.
        const staleReadTime = '2026-01-01 09:00:00.000';
        const commentServerTime = '2026-01-01 10:00:00.000';
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildRead(staleReadTime));
            await SequentialQueue.push(buildComment());
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            expect(capture.readLastReadTime).toBe(staleReadTime);
        } finally {
            processSpy.mockRestore();
        }
    });

    it('keeps the recorded comment time after a read consumes it, so a retried/subsequent read in the same drain can still be bumped', async () => {
        // A failed read is retried with its old data, so the remembered time has to survive the first read.
        const staleReadTime = '2026-01-01 09:00:00.000';
        const commentServerTime = '2026-01-01 10:00:00.000';
        const {spy: processSpy, capture} = mockProcessWithMiddleware(commentServerTime);
        try {
            SequentialQueue.pause();
            await SequentialQueue.push(buildComment());
            await SequentialQueue.push(buildRead(staleReadTime));
            await SequentialQueue.push(buildRead(staleReadTime));
            SequentialQueue.unpause();
            await SequentialQueue.waitForIdle();
            await waitForBatchedUpdates();

            // capture records the LAST read sent — it must also carry the bumped time, proving the entry survived.
            expect(capture.readLastReadTime).toBe(commentServerTime);
        } finally {
            processSpy.mockRestore();
        }
    });
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

describe('SequentialQueue - pause watchdog', () => {
    beforeEach(() => {
        // Keep setImmediate real so waitForBatchedUpdates and Onyx batching still work under fake timers.
        jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick']});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        SequentialQueue.resetQueue();
        SequentialQueue.registerPauseWatchdogEscalation(() => Promise.resolve());
        mockedIsClientTheLeader.mockReturnValue(true);
        NetworkState.setForceOffline(false);
        jest.useRealTimers();
    });

    it('should force-unpause a pause stuck without progress for the full window', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        SequentialQueue.pause();
        expect(SequentialQueue.isPaused()).toBe(true);

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);

        expect(escalation).toHaveBeenCalledTimes(1);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('should re-arm on applied-update progress, so a progressing catch-up is not interrupted', async () => {
        SequentialQueue.registerPauseWatchdogEscalation(() => Promise.resolve());
        SequentialQueue.pause();

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);
        // The client applies a newer update mid-pause: the watchdog window restarts.
        // (No waitForBatchedUpdates here — under fake timers it runs all pending timers, firing the watchdog early; the subscriber callback is synchronous anyway.)
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 12345);

        // Three-quarters of a window later the ORIGINAL deadline is long past, but not the re-armed one.
        await jest.advanceTimersByTimeAsync((CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 4) * 3);
        expect(SequentialQueue.isPaused()).toBe(true);

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 4);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('does not treat a decrease or clear of the applied-update key as progress', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 100);
        SequentialQueue.pause();

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);
        // A decrease (e.g. an Onyx.clear() elsewhere) must not look like this tab making progress.
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 50);

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);

        expect(escalation).toHaveBeenCalledTimes(1);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('should not fire while offline, where a paused queue has no way to advance', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        NetworkState.setForceOffline(true);
        SequentialQueue.pause();

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS * 2);

        // The pause isn't orphaned, the client is just offline. Alerting would poison the telemetry this watchdog
        // exists to produce, the reconnect could not succeed, and force-unpausing would drain WRITEs against a client
        // known to be behind.
        expect(escalation).not.toHaveBeenCalled();
        expect(SequentialQueue.isPaused()).toBe(true);
    });

    it('should stop the clock when going offline mid-window and restart it when connectivity returns', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);

        // Long enough offline to blow both the window and the absolute ceiling.
        NetworkState.setForceOffline(true);
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_ABSOLUTE_TIME_MS * 2);
        expect(escalation).not.toHaveBeenCalled();

        NetworkState.setForceOffline(false);

        // Time spent offline must not count toward the window...
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);
        expect(escalation).not.toHaveBeenCalled();
        expect(SequentialQueue.isPaused()).toBe(true);

        // ...but a full window of online silence still trips it.
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);
        expect(escalation).toHaveBeenCalledTimes(1);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('bounds total pause time by an absolute ceiling that re-arming cannot extend', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        SequentialQueue.pause();

        // Commands in requestsToIgnoreLastUpdateID advance this key even with the gap still open, so a leader whose
        // unpause is orphaned keeps pushing its own deadline out. Half a window at a time, forever.
        const halfWindow = CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2;
        let updateID = 0;
        for (let elapsed = 0; elapsed < CONST.NETWORK.MAX_PAUSE_WATCHDOG_ABSOLUTE_TIME_MS; elapsed += halfWindow) {
            await jest.advanceTimersByTimeAsync(halfWindow);
            updateID += 1;

            await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, updateID);
        }

        await jest.advanceTimersByTimeAsync(halfWindow);

        expect(escalation).toHaveBeenCalledTimes(1);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('does not let a clear of the applied-update key reset the watermark and re-arm on the next value', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 100);
        SequentialQueue.pause();

        // Troubleshoot → "Clear Onyx data" wipes the key mid-pause.
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, null);
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);
        // A value that does not clear the pre-clear watermark is not progress, so the original deadline must hold.
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 60);

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);

        expect(escalation).toHaveBeenCalledTimes(1);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('does not re-arm from another tab advancing the shared key once this tab is demoted', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);
        mockedIsClientTheLeader.mockReturnValue(false);

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);
        // The new leader tab advances the shared key — this demoted tab must still self-heal.
        await Onyx.set(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 12345);

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS / 2);

        expect(escalation).toHaveBeenCalledTimes(1);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('a stale escalation must not unpause a pause that started after it fired', async () => {
        let resolveFirstEscalation: () => void = () => {};
        SequentialQueue.registerPauseWatchdogEscalation(
            () =>
                new Promise<void>((resolve) => {
                    resolveFirstEscalation = resolve;
                }),
        );

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);
        expect(SequentialQueue.isPaused()).toBe(true); // escalation in flight

        // The normal chain resolves the original gap and unpauses, then a fresh gap re-pauses immediately.
        SequentialQueue.unpause();
        SequentialQueue.pause();

        // The stale escalation from the FIRST pause now settles.
        resolveFirstEscalation();
        await jest.advanceTimersByTimeAsync(0);

        // It must not have unpaused the second, unrelated pause.
        expect(SequentialQueue.isPaused()).toBe(true);
    });

    it('a stale escalation must not unpause across a resetQueue that recycles the pause token', async () => {
        let resolveFirstEscalation: () => void = () => {};
        SequentialQueue.registerPauseWatchdogEscalation(
            () =>
                new Promise<void>((resolve) => {
                    resolveFirstEscalation = resolve;
                }),
        );

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);
        expect(SequentialQueue.isPaused()).toBe(true); // escalation in flight

        // Mirrors afterEach running while an escalation is still pending, followed by the next test's pause.
        SequentialQueue.resetQueue();
        SequentialQueue.pause();

        resolveFirstEscalation();
        await jest.advanceTimersByTimeAsync(0);

        // A recycled token would let the previous run's escalation unpause this one.
        expect(SequentialQueue.isPaused()).toBe(true);
    });

    it('should be cleared by a normal unpause and never fire afterwards', async () => {
        const escalation = jest.fn(() => Promise.resolve());
        SequentialQueue.registerPauseWatchdogEscalation(escalation);

        SequentialQueue.pause();
        SequentialQueue.unpause();

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS * 2);

        expect(escalation).not.toHaveBeenCalled();
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('should unpause only after the gap-closing escalation settles', async () => {
        let resolveEscalation: () => void = () => {};
        SequentialQueue.registerPauseWatchdogEscalation(
            () =>
                new Promise<void>((resolve) => {
                    resolveEscalation = resolve;
                }),
        );

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);

        // Escalation is in flight: the queue must stay paused so drained writes don't run against stale data.
        expect(SequentialQueue.isPaused()).toBe(true);

        resolveEscalation();
        await jest.advanceTimersByTimeAsync(0);

        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('should not leave the escalation cap timer armed once the escalation wins the race', async () => {
        let resolveEscalation: () => void = () => {};
        SequentialQueue.registerPauseWatchdogEscalation(
            () =>
                new Promise<void>((resolve) => {
                    resolveEscalation = resolve;
                }),
        );

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);
        const timersWithCapArmed = jest.getTimerCount();

        resolveEscalation();
        await jest.advanceTimersByTimeAsync(0);
        expect(SequentialQueue.isPaused()).toBe(false);

        // The cap lost the race, so its timer must be gone rather than left pending to leak into the next test.
        expect(jest.getTimerCount()).toBe(timersWithCapArmed - 1);
    });

    it('should unpause anyway when the escalation hangs past its cap', async () => {
        SequentialQueue.registerPauseWatchdogEscalation(() => new Promise(() => {}));

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);
        expect(SequentialQueue.isPaused()).toBe(true);

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_ESCALATION_TIME_MS);
        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('should unpause anyway when the escalation rejects', async () => {
        SequentialQueue.registerPauseWatchdogEscalation(() => Promise.reject(new Error('escalation failed')));

        SequentialQueue.pause();
        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);

        expect(SequentialQueue.isPaused()).toBe(false);
    });

    it('should drain the stuck request and clear IS_LOADING_APP after a force-unpause', async () => {
        // This is the bug the watchdog exists for: the stranded OpenApp has to reach the wire and the skeleton has to
        // go away. Asserting only isPaused() would stay green even if the queue never drained.
        await Onyx.set(ONYXKEYS.IS_LOADING_APP, true);
        const processWithMiddleware = jest.spyOn(RequestModule, 'processWithMiddleware').mockResolvedValue({jsonCode: CONST.JSON_CODE.SUCCESS});

        SequentialQueue.pause();
        SequentialQueue.push({
            command: 'OpenApp',
            queueFlushedData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.IS_LOADING_APP, value: false}],
        });

        expect(getLength()).toBe(1);
        expect(processWithMiddleware).not.toHaveBeenCalled();

        await jest.advanceTimersByTimeAsync(CONST.NETWORK.MAX_PAUSE_WATCHDOG_TIME_MS);
        await SequentialQueue.waitForIdle();
        await waitForBatchedUpdates();

        expect(processWithMiddleware).toHaveBeenCalledTimes(1);
        expect(getLength()).toBe(0);
        expect(await getOnyxValue(ONYXKEYS.IS_LOADING_APP)).toBe(false);
    });
});
