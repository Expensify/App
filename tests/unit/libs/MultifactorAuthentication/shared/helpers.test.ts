import {parseHttpResponse} from '@libs/MultifactorAuthentication/shared/helpers';
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
    });
});
