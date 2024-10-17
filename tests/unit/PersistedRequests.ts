import Onyx from 'react-native-onyx';
import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import ONYXKEYS from '../../src/ONYXKEYS';
import type Request from '../../src/types/onyx/Request';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

const request: Request = {
    command: 'OpenReport',
    successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
    failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
};

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
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
        const request2: Request = {
            command: 'AddComment',
            successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
        };
        PersistedRequests.save(request2);
        PersistedRequests.processNextRequest();
        return waitForBatchedUpdates().then(() => {
            expect(PersistedRequests.getAll().length).toBe(1);
            expect(PersistedRequests.getAll().at(0)).toEqual(request2);
        });
    });

    it('update the request at the given index with new data', () => {
        const newRequest: Request = {
            command: 'OpenReport',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
        };
        PersistedRequests.update(0, newRequest);
        expect(PersistedRequests.getAll().at(0)).toEqual(newRequest);
    });

    it('update the ongoing request with new data', () => {
        const newRequest: Request = {
            command: 'OpenReport',
            successData: [{key: 'reportMetadata_1', onyxMethod: 'set', value: {}}],
            failureData: [{key: 'reportMetadata_2', onyxMethod: 'set', value: {}}],
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
