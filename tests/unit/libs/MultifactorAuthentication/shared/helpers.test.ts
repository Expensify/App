import parseHttpRequest from '@libs/MultifactorAuthentication/shared/helpers';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

describe('MultifactorAuthentication shared helpers', () => {
    describe('parseHttpRequest', () => {
        it('should parse valid HTTP code and return reason', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest(200, responseMap, 'Success');

            expect(result.httpStatusCode).toBe(200);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.CHALLENGE_GENERATED);
        });

        it('should handle string HTTP codes', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest('401', responseMap, 'Too many attempts');

            expect(result.httpStatusCode).toBe(401);
            expect(result.reason).toBe(VALUES.REASON.BACKEND.TOO_MANY_ATTEMPTS);
        });

        it('should return unknown reason for unmapped code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest(999, responseMap, 'Something is needed');

            expect(result.httpStatusCode).toBe(999);
            expect(result.reason).toBe(VALUES.REASON.GENERIC.UNKNOWN_RESPONSE);
        });

        it('should handle undefined HTTP code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpRequest(undefined, responseMap, undefined);

            expect(result.httpStatusCode).toBe(0);
            expect(result.reason).toBe(VALUES.REASON.GENERIC.UNKNOWN_RESPONSE);
        });
    });
});
