import * as PersistedRequests from '../../src/libs/actions/PersistedRequests';
import type Request from '../../src/types/onyx/Request';

const request: Request = {
    command: 'OpenReport',
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
    it('save a request without conflicts', () => {
        PersistedRequests.save(request);
        expect(PersistedRequests.getAll().length).toBe(2);
    });

    it('save a new request with conflict resolution', () => {
        const handleConflictingRequest = jest.fn();
        const newRequest = {
            command: 'ThingA',
            getConflictingRequests: (requests: Request[]) => requests,
            handleConflictingRequest,
        };
        const secondRequest = {
            command: 'ThingB',
            getConflictingRequests: (requests: Request[]) => requests,
            shouldIncludeCurrentRequest: true,
        };
        PersistedRequests.save(newRequest);
        PersistedRequests.save(secondRequest);
        expect(PersistedRequests.getAll().length).toBe(1);
        expect(handleConflictingRequest).toHaveBeenCalledWith(request);
        expect(handleConflictingRequest).toHaveBeenCalledTimes(1);
    });

    it('remove a request from the PersistedRequests array', () => {
        PersistedRequests.remove(request);
        expect(PersistedRequests.getAll().length).toBe(0);
    });
});
