import Onyx from 'react-native-onyx';
import * as PersistedRequests from '@userActions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import type Request from '../../src/types/onyx/Request';
import type {ConflictActionData} from '../../src/types/onyx/Request';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const request: Request = {
    command: 'ReconnectApp',
    successData: [{key: 'userMetadata', onyxMethod: 'set', value: {accountID: 1234}}],
    failureData: [{key: 'userMetadata', onyxMethod: 'set', value: {}}],
};

describe('SequentialQueue', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('should push one request and persist one', () => {
        SequentialQueue.push(request);
        expect(PersistedRequests.getLength()).toBe(1);
    });

    it('should push two requests and persist two', () => {
        SequentialQueue.push(request);
        SequentialQueue.push(request);
        expect(PersistedRequests.getLength()).toBe(2);
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
        expect(PersistedRequests.getLength()).toBe(1);
        // We know there is only one request in the queue, so we can get the first one and verify
        // that the persisted request is the second one.
        const persistedRequest = PersistedRequests.getAll()[0];
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
        expect(PersistedRequests.getLength()).toBe(2);
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
        expect(PersistedRequests.getLength()).toBe(1);
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
        expect(PersistedRequests.getLength()).toBe(2);
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

        expect(PersistedRequests.getLength()).toBe(2);
    });

    it('should replace request request in queue while a similar one is ongoing and keep the same index', async () => {
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

        expect(PersistedRequests.getLength()).toBe(4);
        const persistedRequests = PersistedRequests.getAll();
        // We know ReconnectApp is at index 1 in the queue, so we can get it to verify
        // that was replaced by the new request.
        expect(persistedRequests[1]?.data?.accountID).toBe(56789);
    });
});
