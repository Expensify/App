import Onyx from 'react-native-onyx';
import type {OnyxSetInput, OnyxUpdate} from 'react-native-onyx';
import {waitForActiveRequestsToBeEmpty} from '@libs/E2E/utils/NetworkInterceptor';
import {getAll, getLength, getOngoingRequest} from '@userActions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import type Request from '../../src/types/onyx/Request';
import type {ConflictActionData} from '../../src/types/onyx/Request';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const request: Request<'userMetadata'> = {
    command: 'ReconnectApp',
    successData: [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}],
    failureData: [{key: 'userMetadata', onyxMethod: 'set', value: {}}],
};
beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
    });
});
beforeEach(() => {
    global.fetch = TestHelper.getGlobalFetchMock();
    return Onyx.clear().then(waitForBatchedUpdates);
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

    it('should push two requests with conflict resolution and replace', () => {
        SequentialQueue.push(request);
        const requestWithConflictResolution: Request = {
            command: 'ReconnectApp',
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
        SequentialQueue.push(requestWithConflictResolution);
        expect(getLength()).toBe(1);
        // We know there is only one request in the queue, so we can get the first one and verify
        // that the persisted request is the second one.
        const persistedRequest = getAll().at(0);
        expect(persistedRequest?.data?.accountID).toBe(56789);
    });

    it('should push two requests with conflict resolution and push', () => {
        SequentialQueue.push(request);
        const requestWithConflictResolution: Request = {
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
        const requestWithConflictResolution: Request = {
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
        // .push at the end flush the queue
        SequentialQueue.push(request);

        // wait for Onyx.connect execute the callback and start processing the queue
        await Promise.resolve();

        const requestWithConflictResolution: Request = {
            command: 'ReconnectApp',
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

        SequentialQueue.push(requestWithConflictResolution);
        expect(getLength()).toBe(2);
    });

    it('should replace request request in queue while a similar one is ongoing', async () => {
        // .push at the end flush the queue
        SequentialQueue.push(request);

        // wait for Onyx.connect execute the callback and start processing the queue
        await Promise.resolve();

        const conflictResolver = (persistedRequests: Request[]): ConflictActionData => {
            // should be one instance of ReconnectApp, get the index to replace it later
            const index = persistedRequests.findIndex((r) => r.command === 'ReconnectApp');
            if (index === -1) {
                return {conflictAction: {type: 'push'}};
            }

            return {
                conflictAction: {type: 'replace', index},
            };
        };

        const requestWithConflictResolution: Request = {
            command: 'ReconnectApp',
            data: {accountID: 56789},
            checkAndFixConflictingRequest: conflictResolver,
        };

        const requestWithConflictResolution2: Request = {
            command: 'ReconnectApp',
            data: {accountID: 56789},
            checkAndFixConflictingRequest: conflictResolver,
        };

        SequentialQueue.push(requestWithConflictResolution);
        SequentialQueue.push(requestWithConflictResolution2);

        expect(getLength()).toBe(2);
    });

    it('should replace request request in queue while a similar one is ongoing and keep the same index', () => {
        SequentialQueue.push({command: 'OpenReport'});
        SequentialQueue.push(request);

        const requestWithConflictResolution: Request = {
            command: 'ReconnectApp',
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

        SequentialQueue.push(requestWithConflictResolution);
        SequentialQueue.push({command: 'AddComment'});
        SequentialQueue.push({command: 'OpenReport'});

        expect(getLength()).toBe(4);
        const persistedRequests = getAll();
        // We know ReconnectApp is at index 1 in the queue, so we can get it to verify
        // that was replaced by the new request.
        expect(persistedRequests.at(1)?.data?.accountID).toBe(56789);
    });

    // need to test a rance condition between processing the next request and then pushing a new request with conflict resolver
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
        const requestWithConflictResolution: Request = {
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
        await waitForActiveRequestsToBeEmpty();
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
        Onyx.set<typeof ONYXKEYS.PERSISTED_ONGOING_REQUESTS>(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, persistedRequest as OnyxSetInput<typeof ONYXKEYS.PERSISTED_ONGOING_REQUESTS>);
        SequentialQueue.push({command: 'OpenReport'});

        await Promise.resolve();

        expect(persistedRequest).toEqual(getOngoingRequest());
        expect(getAll().length).toBe(1);
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
});
