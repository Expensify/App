import {decodeExpoMessage, parseHttpRequest} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';

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
