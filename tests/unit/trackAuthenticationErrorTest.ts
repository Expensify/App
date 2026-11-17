import HttpsError from '@libs/Errors/HttpsError';
import trackAuthenticationError from '@libs/telemetry/trackAuthenticationError';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
    logger: {warn: jest.fn()},
    captureException: jest.fn(),
}));

describe('trackAuthenticationError', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it.each([401, 404, 418, 426, '426'])('should send an auth_failure with expected code %p to Sentry logs', (jsonCode) => {
        // Given an Authenticate response that signs the user out on purpose
        const error = new Error('Authentication failed');

        // When it is tracked
        trackAuthenticationError(error, {errorType: 'auth_failure', functionName: 'reauthenticate', jsonCode});

        // Then it lands in Sentry logs and stays out of the error stream
        expect(Sentry.logger.warn).toHaveBeenCalledWith('[Authentication] auth_failure', expect.objectContaining({[CONST.TELEMETRY.TAGS.AUTHENTICATION_JSON_CODE]: String(jsonCode)}));
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it.each([500, 503, undefined])('should send an auth_failure with code %p to the error stream', (jsonCode) => {
        // Given an Authenticate failure that points to a real problem
        const error = new Error('Authentication failed');

        // When it is tracked
        trackAuthenticationError(error, {errorType: 'auth_failure', functionName: 'reauthenticate', jsonCode});

        // Then it is still reported as an error so it stays visible
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.anything());
        expect(Sentry.logger.warn).not.toHaveBeenCalled();
    });

    it('should send an unexpected_error with an expected code to the error stream', () => {
        // Given an error type other than auth_failure that happens to carry an expected code
        const error = new Error('Unexpected');

        // When it is tracked
        trackAuthenticationError(error, {errorType: 'unexpected_error', functionName: 'reauthenticate', jsonCode: 426});

        // Then the code filter does not apply and it is reported as an error
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.anything());
        expect(Sentry.logger.warn).not.toHaveBeenCalled();
    });

    it('should send an HTTP-level auth_failure with an expected code to the error stream', () => {
        // Given Authenticate failing with HTTP 404, which means the endpoint is unreachable rather than the credentials being stale
        const error = new HttpsError({message: 'Not Found', status: '404'});

        // When it is tracked with the HTTP status as its code
        trackAuthenticationError(error, {errorType: 'auth_failure', functionName: 'reauthenticate', jsonCode: 404});

        // Then it is still reported as an error so an infrastructure outage stays visible
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.anything());
        expect(Sentry.logger.warn).not.toHaveBeenCalled();
    });
});
