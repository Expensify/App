import prepareRequestPayload from '@libs/prepareRequestPayload';

describe('prepareRequestPayload', () => {
    it('should append string values to FormData', async () => {
        const formData = await prepareRequestPayload('TestCommand', {authToken: 'abc123', email: 'test@example.com'}, false);

        expect(formData.get('authToken')).toBe('abc123');
        expect(formData.get('email')).toBe('test@example.com');
    });

    it('should omit null values from FormData instead of coercing them to the string "null"', async () => {
        const formData = await prepareRequestPayload('TestCommand', {authToken: null, email: null, referer: 'ecash'}, false);

        expect(formData.has('authToken')).toBe(false);
        expect(formData.has('email')).toBe(false);
        expect(formData.get('referer')).toBe('ecash');
    });

    it('should omit undefined values from FormData', async () => {
        const formData = await prepareRequestPayload('TestCommand', {authToken: undefined, platform: 'web'}, false);

        expect(formData.has('authToken')).toBe(false);
        expect(formData.get('platform')).toBe('web');
    });

    it('should include falsy non-null/undefined values (0, false, empty string)', async () => {
        const formData = await prepareRequestPayload('TestCommand', {count: 0, flag: false, label: ''}, false);

        expect(formData.get('count')).toBe('0');
        expect(formData.get('flag')).toBe('false');
        expect(formData.get('label')).toBe('');
    });

    it('should warn when an unsupported object value is passed', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        await prepareRequestPayload('TestCommand', {badParam: {nested: 'object'}}, false);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("An unsupported value was passed to command 'TestCommand' (parameter: 'badParam')"));
        warnSpy.mockRestore();
    });

    it('should not warn for valid primitive values', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        await prepareRequestPayload('TestCommand', {str: 'hello', num: 42, bool: true}, false);

        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('should return an empty FormData when all values are null or undefined', async () => {
        const formData = await prepareRequestPayload('TestCommand', {a: null, b: undefined}, false);
        const entries = Array.from(formData.entries());

        expect(entries).toHaveLength(0);
    });

    it('should return an empty FormData for an empty data object', async () => {
        const formData = await prepareRequestPayload('TestCommand', {}, false);
        const entries = Array.from(formData.entries());

        expect(entries).toHaveLength(0);
    });

    it('should append Blob values without warning', async () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const blob = new Blob(['file content'], {type: 'text/plain'});

        await prepareRequestPayload('TestCommand', {file: blob}, false);

        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
