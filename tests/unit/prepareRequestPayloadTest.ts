import prepareRequestPayload from '@libs/prepareRequestPayload';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('prepareRequestPayload', () => {
    it('should append string values to FormData', async () => {
        const promise = prepareRequestPayload('TestCommand', {authToken: 'abc123', email: 'test@example.com'}, false);
        const formData = await waitForBatchedUpdates().then(() => promise);

        expect(formData.get('authToken')).toBe('abc123');
        expect(formData.get('email')).toBe('test@example.com');
    });

    it('should omit null values from FormData instead of coercing them to the string "null"', async () => {
        const promise = prepareRequestPayload('TestCommand', {authToken: null, email: null, referer: 'ecash'}, false);
        const formData = await waitForBatchedUpdates().then(() => promise);

        expect(formData.has('authToken')).toBe(false);
        expect(formData.has('email')).toBe(false);
        expect(formData.get('referer')).toBe('ecash');
    });

    it('should omit undefined values from FormData', async () => {
        const promise = prepareRequestPayload('TestCommand', {authToken: undefined, platform: 'web'}, false);
        const formData = await waitForBatchedUpdates().then(() => promise);

        expect(formData.has('authToken')).toBe(false);
        expect(formData.get('platform')).toBe('web');
    });

    it('should include falsy non-null/undefined values (0, false, empty string)', async () => {
        const promise = prepareRequestPayload('TestCommand', {count: 0, flag: false, label: ''}, false);
        const formData = await waitForBatchedUpdates().then(() => promise);

        expect(formData.get('count')).toBe('0');
        expect(formData.get('flag')).toBe('false');
        expect(formData.get('label')).toBe('');
    });

    it('should return an empty FormData for an empty data object', async () => {
        const promise = prepareRequestPayload('TestCommand', {}, false);
        const formData = await waitForBatchedUpdates().then(() => promise);
        const entries = Array.from(formData.entries());

        expect(entries).toHaveLength(0);
    });
});
