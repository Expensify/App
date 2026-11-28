import {isSignedChallengeFailure, parseHttpResponse} from '@libs/MultifactorAuthentication/shared/helpers';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

describe('MultifactorAuthentication shared helpers', () => {
    describe('parseHttpResponse', () => {
        it('should return undefined reason for a 200 response when the map has no SUCCESS entry', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(200, responseMap, 'OK');

            expect(result.httpStatusCode).toBe(200);
            expect(result.reason).toBeUndefined();
        });

        it('should match a 4xx message and return the corresponding reason', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(401, responseMap, 'Registration required');

            expect(result.httpStatusCode).toBe(401);
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
        });

        it('should return LOCAL_ERROR for an unmapped HTTP code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(999, responseMap, 'Something is needed');

            expect(result.httpStatusCode).toBe(999);
            expect(result.reason).toBe(VALUES.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);
        });

        it('should return LOCAL_ERROR for an undefined HTTP code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(undefined, responseMap, undefined);

            expect(result.httpStatusCode).toBe(0);
            expect(result.reason).toBe(VALUES.REASON.LOCAL_ERRORS.UNHANDLED_API_RESPONSE);
        });

        it('should return the same reason for the same message regardless of 4xx status code', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result401 = parseHttpResponse(401, responseMap, 'Registration required');
            const result418 = parseHttpResponse(418, responseMap, 'Registration required');

            expect(result401.reason).toBe(VALUES.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
            expect(result418.reason).toBe(VALUES.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
        });

        it('should match backend messages case-insensitively', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const resultUpper = parseHttpResponse(401, responseMap, 'REGISTRATION REQUIRED');
            const resultMixed = parseHttpResponse(401, responseMap, 'Registration REQUIRED');

            expect(resultUpper.reason).toBe(VALUES.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
            expect(resultMixed.reason).toBe(VALUES.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
        });

        it('should fall back to CLIENT_ERROR for a 4xx response with no matching message', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(403, responseMap, 'Some unrecognized error');

            expect(result.httpStatusCode).toBe(403);
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.UNRECOGNIZED);
        });

        it('should fall back to SERVER_ERROR for a 5xx response with no matching message', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(503, responseMap, 'Service unavailable');

            expect(result.httpStatusCode).toBe(503);
            expect(result.reason).toBe(VALUES.REASON.SERVER_ERRORS.UNRECOGNIZED);
        });

        it('should return the string reason directly when SUCCESS maps to a string (DENY_TRANSACTION)', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.DENY_TRANSACTION;
            const result = parseHttpResponse(200, responseMap, undefined);

            expect(result.httpStatusCode).toBe(200);
            expect(result.reason).toBe(VALUES.REASON.FLOW_OUTCOMES.TRANSACTION_DENIED);
        });

        it('should fall back to CLIENT_ERROR for a 4xx response when the source map is empty', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.CHANGE_CARD_PIN;
            const result = parseHttpResponse(400, responseMap, 'Some error');

            expect(result.httpStatusCode).toBe(400);
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.UNRECOGNIZED);
        });

        it('should match backend message via endsWith when response has a prefix', () => {
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;
            const result = parseHttpResponse(401, responseMap, 'Error: Registration required');

            expect(result.httpStatusCode).toBe(401);
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.REGISTRATION_REQUIRED);
        });

        it('should resolve the real backend invalid validate code message to a continuable reason', () => {
            // Given the exact message the backend returns when a user submits a wrong magic code
            const responseMap = VALUES.API_RESPONSE_MAP.REQUEST_AUTHENTICATION_CHALLENGE;

            // When the response is parsed
            const result = parseHttpResponse(401, responseMap, '401 Not authorized - Invalid validateCode');

            // Then it must resolve to INVALID_VALIDATE_CODE, which keeps the user on the magic code screen.
            // Falling back to UNRECOGNIZED here is treated as a fatal error and dead-ends the flow on the failure screen.
            expect(result.httpStatusCode).toBe(401);
            expect(result.reason).toBe(VALUES.REASON.CLIENT_ERRORS.INVALID_VALIDATE_CODE);
        });
    });

    describe('isSignedChallengeFailure', () => {
        it('matches the challenge rejections every MFA command returns, with the status prefix', () => {
            // Given the 4xx responses the backend sends when it rejects a signed challenge
            // When they are checked
            // Then each one counts as a challenge failure
            expect(isSignedChallengeFailure(401, '401 Authentication required')).toBe(true);
            expect(isSignedChallengeFailure(401, '401 Unauthorized')).toBe(true);
            expect(isSignedChallengeFailure(401, '401 Registration required')).toBe(true);
            expect(isSignedChallengeFailure(401, '401 Invalid signed challenge')).toBe(true);
            expect(isSignedChallengeFailure(400, '400 Invalid authentication method')).toBe(true);
        });

        it('does not match failures that come after the challenge passed', () => {
            // Given card or provider errors, a 5xx and a missing message
            // When they are checked
            // Then none of them counts as a challenge failure
            expect(isSignedChallengeFailure(404, '404 Could not find an active card for user trying to create a digital wallet')).toBe(false);
            expect(isSignedChallengeFailure(401, '401 Not authorized - This card requires SCA')).toBe(false);
            expect(isSignedChallengeFailure(500, '500 Unauthorized')).toBe(false);
            expect(isSignedChallengeFailure(401, undefined)).toBe(false);
        });
    });
});
