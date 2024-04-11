import Onyx from 'react-native-onyx';
import * as PersistedRequests from '@userActions/PersistedRequests';
import ONYXKEYS from '@src/ONYXKEYS';
import * as SequentialQueue from '../../src/libs/Network/SequentialQueue';
import type Request from '../../src/types/onyx/Request';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const request: Request = {
    command: 'OpenReport',
    successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
    failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
};

describe('SequentialQueue', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        PersistedRequests.save(request);

        // @ts-expect-error TODO: Remove this once TestHelper (https://github.com/Expensify/App/issues/25318) is migrated to TypeScript.
        global.fetch = TestHelper.getGlobalFetchMock();
    });

    afterEach(async () => {
        await PersistedRequests.clear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('saves a request without conflicts', () => {
        SequentialQueue.push(request);
        expect(PersistedRequests.getAll().length).toBe(2);
    });

    it('save a new request with conflict resolution', () => {
        expect(PersistedRequests.getAll().length).toBe(1);
        const handleConflictingRequest = jest.fn();
        const newRequest = {
            command: 'ThingA',
            getConflictingRequests: (requests: Request[]) => requests,
            handleConflictingRequest,
        };
        SequentialQueue.push(newRequest);
        expect(PersistedRequests.getAll().length).toBe(1);
        expect(handleConflictingRequest).toHaveBeenCalledWith(request);
        expect(handleConflictingRequest).toHaveBeenCalledTimes(1);
    });

    it('save a new request with conflict resolution and cancelling out new request', () => {
        expect(PersistedRequests.getAll().length).toBe(1);
        const newRequest = {
            command: 'ThingA',
            getConflictingRequests: (requests: Request[]) => requests,
            shouldSkipThisRequestOnConflict: true,
        };
        SequentialQueue.push(newRequest);
        expect(PersistedRequests.getAll().length).toBe(0);
    });

    it('a request should never conflict with itself if there are no other queued requests', () => {
        PersistedRequests.remove(request);
        expect(PersistedRequests.getAll().length).toBe(0);

        const newRequest: Request = {...request, getConflictingRequests: (requests: Request[]) => requests};
        SequentialQueue.push(newRequest);
        expect(PersistedRequests.getAll().length).toBe(1);

        PersistedRequests.remove(newRequest);
        expect(PersistedRequests.getAll().length).toBe(0);

        SequentialQueue.push({...request, getConflictingRequests: (requests: Request[]) => requests, shouldSkipThisRequestOnConflict: true});
        expect(PersistedRequests.getAll().length).toBe(1);
    });

    it('should always ignore any requests that have already been sent', async () => {
        expect(PersistedRequests.getAll().length).toBe(1);
        SequentialQueue.flush();

        // Wait for the queue to start processing (this is async because it uses an Onyx.connect callback, but don't wait for all async activity to finish
        // We want to test the case where we try to synchronously add a request to the queue while there's another one still processing
        // eslint-disable-next-line @typescript-eslint/unbound-method
        await new Promise(process.nextTick);

        // Ensure the first request is still processing
        expect(PersistedRequests.getAll().length).toBe(1);

        const newRequest = {
            command: 'ThingA',
            getConflictingRequests: (requests: Request[]) => requests,
            shouldSkipThisRequestOnConflict: true,
        };
        SequentialQueue.push(newRequest);

        // Verify that we ignored the conflict with any request that's already processing
        expect(PersistedRequests.getAll().length).toBe(2);
    });
});
