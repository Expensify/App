import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import Request from '../../src/types/onyx/Request';

const request: Request = {
    command: 'OpenReport',
    data: {
        idempotencyKey: 'OpenReport_1',
    },
    successData: [{key: 'reportMetadata_1', onyxMethod: 'merge', value: {}}],
    failureData: [{key: 'reportMetadata_2', onyxMethod: 'merge', value: {}}],
};

beforeEach(() => {
    PersistedRequests.clear();
    PersistedRequests.save(request);
});

afterEach(() => {
    PersistedRequests.clear();
});

describe('PersistedRequests', () => {
    it('save a new request with an idempotency key which currently exists in PersistedRequests', () => {
        PersistedRequests.save(request);
        expect(PersistedRequests.getAll().length).toBe(1);
    });

    it('save a new request with a new idempotency key', () => {
        const newRequest = {
            command: 'OpenReport',
            data: {
                idempotencyKey: 'OpenReport_2',
            },
        };
        PersistedRequests.save(newRequest);
        expect(PersistedRequests.getAll().length).toBe(2);
    });

    it('merge a new request with one existing in PersistedRequests array', () => {
        const newRequest: Request = {
            command: 'OpenReport',
            data: {
                idempotencyKey: 'OpenReport_1',
            },
            successData: [{key: 'reportMetadata_3', onyxMethod: 'merge', value: {}}],
            failureData: [{key: 'reportMetadata_4', onyxMethod: 'merge', value: {}}],
        };

        PersistedRequests.save(newRequest);

        const persistedRequests = PersistedRequests.getAll();

        expect(persistedRequests.length).toBe(1);

        const mergedRequest = persistedRequests[0];

        expect(mergedRequest.successData?.length).toBe(2);
        expect(mergedRequest.failureData?.length).toBe(2);
    });

    it('remove a request from the PersistedRequests array', () => {
        PersistedRequests.remove(request);
        expect(PersistedRequests.getAll().length).toBe(0);
    });
});
