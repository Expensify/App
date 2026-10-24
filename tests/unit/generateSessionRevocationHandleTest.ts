import generateNativeHandle from '@libs/generateSessionRevocationHandle/index.native';

import {randomBytes} from 'react-native-quick-crypto';

// Select the browser implementation explicitly because Jest otherwise resolves the native variant.
const {default: generateWebHandle} = jest.requireActual<{default: () => Promise<string>}>('../../src/libs/generateSessionRevocationHandle/index.ts');

jest.mock('react-native-quick-crypto', () => ({randomBytes: jest.fn((length: number) => Buffer.alloc(length, 0xa7))}));

describe('Completion capability generation', () => {
    afterEach(() => jest.restoreAllMocks());

    it('uses 32 native secure random bytes even without browser crypto', async () => {
        // Given native secure randomness and a browser RNG that cannot be used
        const browserRNG = jest.spyOn(crypto, 'getRandomValues').mockImplementation(() => {
            throw new Error('Browser RNG unavailable');
        });

        // When the native capability is generated
        const handle = await generateNativeHandle();

        // Then it uses the native RNG and returns the exact wire format
        expect(randomBytes).toHaveBeenCalledWith(32);
        expect(handle).toMatch(/^[a-f0-9]{64}$/);
        expect(browserRNG).not.toHaveBeenCalled();
    });

    it('uses browser secure randomness and never falls back when it is unavailable', async () => {
        // Given a browser with a functioning secure RNG
        const rng = jest.spyOn(crypto, 'getRandomValues');
        const first = await generateWebHandle();
        const second = await generateWebHandle();
        expect(first).toMatch(/^[a-f0-9]{64}$/);
        expect(second).not.toBe(first);
        expect(rng.mock.calls.at(0)?.at(0)).toHaveLength(32);

        // When secure randomness becomes unavailable
        rng.mockImplementation(() => {
            throw new Error('Secure RNG unavailable');
        });

        // Then generation fails instead of issuing a guessable capability
        expect(() => generateWebHandle()).toThrow('Secure RNG unavailable');
    });
});
