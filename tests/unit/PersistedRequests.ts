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

    it('remove a request from the PersistedRequests array', () => {
        PersistedRequests.remove(request);
        expect(PersistedRequests.getAll().length).toBe(0);
    });
});
