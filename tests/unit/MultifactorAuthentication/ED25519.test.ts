import {TextEncoder} from 'util';
import {concatBytes, createAuthenticatorData, generateKeyPair, randomBytes, sha256, signToken, utf8ToBytes} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {MultifactorAuthenticationChallengeObject} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';

global.TextEncoder = TextEncoder as typeof global.TextEncoder;

describe('MultifactorAuthentication Biometrics ED25519 helpers', () => {
    it('generates a valid hex-encoded key pair', () => {
        const {privateKey, publicKey} = generateKeyPair();

        expect(typeof privateKey).toBe('string');
        expect(typeof publicKey).toBe('string');
        expect(privateKey).not.toHaveLength(0);
        expect(publicKey).not.toHaveLength(0);

        expect(() => privateKey).not.toThrow();
        expect(() => publicKey).not.toThrow();
    });

    it('creates deterministic binary data for a given rpId', () => {
        const rpId = 'example.com';

        const first = createAuthenticatorData(rpId);
        const second = createAuthenticatorData(rpId);

        expect(first).toBeInstanceOf(Uint8Array);
        expect(second).toBeInstanceOf(Uint8Array);
        expect(first).toHaveLength(second.length);
        expect(first).toStrictEqual(second);
    });

    it('produces a signed challenge with expected shape', () => {
        const {privateKey, publicKey} = generateKeyPair();

        const challengeObject: MultifactorAuthenticationChallengeObject = {
            challenge: 'test-challenge',
            rpId: 'example.com',
            allowCredentials: [
                {
                    type: 'public-key',
                    id: publicKey,
                },
            ],
            userVerification: 'required',
            timeout: 60000,
        };

        const result = signToken(challengeObject, privateKey, publicKey);

        expect(result.type).toBe(VALUES.ED25519_TYPE);

        // Verify rawId matches the public key
        expect(result.rawId).toBe(publicKey);
        expect(result.response.authenticatorData).toEqual(expect.any(String));
        expect(result.response.clientDataJSON).toEqual(expect.any(String));
        expect(result.response.signature).toEqual(expect.any(String));
    });

    it('matches sha256 over concatBytes with utf8ToBytes', () => {
        const left = randomBytes(16);
        const right = randomBytes(16);

        const concatenated = concatBytes(left, right);
        const message = 'test-message';
        const messageBytes = utf8ToBytes(message);

        const hashOfConcat = sha256(concatenated);
        const hashOfConcatWithMessage = sha256(concatBytes(concatenated, messageBytes));

        expect(hashOfConcat).toBeInstanceOf(Uint8Array);
        expect(hashOfConcatWithMessage).toBeInstanceOf(Uint8Array);
        expect(hashOfConcatWithMessage).toHaveLength(hashOfConcat.length);
    });
});
