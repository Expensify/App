import isOpaqueNativeFetchError from '@libs/isOpaqueNativeFetchError';

describe('isOpaqueNativeFetchError', () => {
    it.each(['Unknown St13runtime_error error.', 'Unknown std::runtime_error error.', 'Unknown std::__1::runtime_error error.'])('recognizes the Nitro exception message "%s"', (message) => {
        expect(isOpaqueNativeFetchError(new Error(message))).toBe(true);
    });

    it.each([
        'Unknown error',
        'Unknown host error occurred while resolving the address.',
        'Unknown St13runtime_error exception.',
        'Unknown St13runtime_error error',
        'Unknown St13runtime_error error. Extra context',
    ])('does not recognize the lookalike message "%s"', (message) => {
        expect(isOpaqueNativeFetchError(new Error(message))).toBe(false);
    });

    it.each([undefined, null, 'Unknown St13runtime_error error.', {message: 'Unknown St13runtime_error error.'}])('rejects the non-Error value %p', (value) => {
        expect(isOpaqueNativeFetchError(value)).toBe(false);
    });
});
