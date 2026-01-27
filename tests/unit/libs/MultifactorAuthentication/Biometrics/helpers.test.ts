import type {MultifactorAuthenticationChallengeObject, SignedChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {decodeExpoMessage, isChallengeSigned, parseHttpRequest, processRegistration} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import {registerAuthenticationKey} from '@userActions/MultifactorAuthentication';

jest.mock('@userActions/MultifactorAuthentication');
jest.mock('@libs/MultifactorAuthentication/Biometrics/ED25519', () => ({
    generateKeyPair: jest.fn(() => ({
        publicKey: 'test-public-key',
        privateKey: 'test-private-key',
    })),
}));
jest.mock('@components/MultifactorAuthentication/config', () => ({
    MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'BIOMETRICS-TEST': {
            action: jest.fn(),
        },
    },
}));

describe('MultifactorAuthentication Biometrics helpers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('parseHttpCode', () => {
        it('should parse valid HTTP code and return reason', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest(200, responseMap, 'Success');

            expect(result.httpCode).toBe(200);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.CHALLENGE_GENERATED);
        });

        it('should handle string HTTP codes', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest('401', responseMap, 'Too many attempts');

            expect(result.httpCode).toBe(401);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.TOO_MANY_ATTEMPTS);
        });

        it('should return unknown reason for unmapped code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest(999, responseMap, 'Something is needed');

            expect(result.httpCode).toBe(999);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.UNKNOWN_RESPONSE);
        });

        it('should handle undefined HTTP code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest(undefined, responseMap, undefined);

            expect(result.httpCode).toBe(0);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.UNKNOWN_RESPONSE);
        });
    });

    describe('isChallengeSigned', () => {
        it('should return true for signed challenge with rawId', () => {
            const signedChallenge: SignedChallenge = {
                rawId: 'base64-encoded-id',
                type: 'biometric',
                response: {
                    clientDataJSON: 'test-data',
                    authenticatorData: 'test-data',
                    signature: 'test-data',
                },
            };

            expect(isChallengeSigned(signedChallenge)).toBe(true);
        });

        it('should return false for unsigned challenge without rawId', () => {
            const unsignedChallenge: MultifactorAuthenticationChallengeObject = {
                challenge: 'test-challenge',
                timeout: 60000,
                rpId: 'expensify.com',
                userVerification: 'test-data',
                allowCredentials: [],
            };

            expect(isChallengeSigned(unsignedChallenge)).toBe(false);
        });

        it('should return true only if rawId property is present', () => {
            const objectWithRawId = {challenge: 'test-challenge', timeout: 60000, rpId: 'expensify.com', userVerification: 'test-data', allowCredentials: [], rawId: 'test-data'};
            const objectWithoutRawId = {challenge: 'test-challenge', timeout: 60000, rpId: 'expensify.com', userVerification: 'test-data', allowCredentials: []};

            expect(isChallengeSigned(objectWithRawId)).toBe(true);
            expect(isChallengeSigned(objectWithoutRawId)).toBe(false);
        });
    });

    describe('processRegistration', () => {
        it('should validate and register biometrics with backend', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpCode: 200,
                reason: VALUES.REASON.BACKEND.BIOMETRICS_REGISTERED,
            });

            const result = await processRegistration({
                publicKey: 'test-public-key',
                validateCode: 123456,
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.value).toBe(true);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.BIOMETRICS_REGISTERED);
            expect(result.step.wasRecentStepSuccessful).toBe(true);
        });

        it('should handle missing validate code', async () => {
            const result = await processRegistration({
                publicKey: 'test-public-key',
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.value).not.toBe(true);
            expect(result.reason).toBe(VALUES.REASON.GENERIC.VALIDATE_CODE_MISSING);
            expect(result.step.requiredFactorForNextStep).toBe(VALUES.FACTORS.VALIDATE_CODE);
        });

        it('should have proper error handling structure', async () => {
            const result = await processRegistration({
                validateCode: 123456,
                publicKey: 'valid-key',
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result).toHaveProperty('value');
            expect(result).toHaveProperty('step');
            expect(result).toHaveProperty('reason');
        });

        it('should handle backend registration failure', async () => {
            (registerAuthenticationKey as jest.Mock).mockResolvedValue({
                httpCode: 409,
                reason: VALUES.REASON.BACKEND.INVALID_KEY,
            });

            const result = await processRegistration({
                publicKey: 'test-public-key',
                validateCode: 123456,
                authenticationMethod: 'BIOMETRIC_FACE',
            });

            expect(result.value).toBe(false);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.INVALID_KEY);
            expect(result.step.wasRecentStepSuccessful).toBe(false);
        });
    });

    describe('decodeExpoMessage', () => {
        it('should decode user canceled error', () => {
            const result = decodeExpoMessage('User canceled the action. Caused by: canceled');

            expect(result).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should decode authentication in progress error', () => {
            const result = decodeExpoMessage('Authentication already in progress. Caused by: in progress');

            expect(result).toBe(VALUES.REASON.EXPO.IN_PROGRESS);
        });

        it('should decode not in foreground error', () => {
            const result = decodeExpoMessage('App not in foreground. Caused by: not in the foreground');

            expect(result).toBe(VALUES.REASON.EXPO.NOT_IN_FOREGROUND);
        });

        it('should decode key exists error', () => {
            const result = decodeExpoMessage('This key already exists. Caused by: already exists');

            expect(result).toBe(VALUES.REASON.EXPO.KEY_EXISTS);
        });

        it('should decode no authentication method error', () => {
            const result = decodeExpoMessage('No authentication method available');

            expect(result).toBe(VALUES.REASON.EXPO.NO_METHOD_AVAILABLE);
        });

        it('should decode old android error', () => {
            const result = decodeExpoMessage('NoSuchMethodError: Cannot find method');

            expect(result).toBe(VALUES.REASON.EXPO.NOT_SUPPORTED);
        });

        it('should return generic error for unknown error', () => {
            const result = decodeExpoMessage('Unknown error message');

            expect(result).toBe(VALUES.REASON.EXPO.GENERIC);
        });

        it('should handle error object', () => {
            const errorObj = new Error('canceled');
            const result = decodeExpoMessage(errorObj);

            expect(result).toBe(VALUES.REASON.EXPO.CANCELED);
        });

        it('should use fallback when error is generic and fallback is provided', () => {
            const result = decodeExpoMessage('Unknown error', VALUES.REASON.BACKEND.REGISTRATION_REQUIRED);

            expect(result).toBe(VALUES.REASON.BACKEND.REGISTRATION_REQUIRED);
        });
    });
});
