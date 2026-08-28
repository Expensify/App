import trackAuthenticationError from '@libs/telemetry/trackAuthenticationError';

import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
    captureException: jest.fn(),
    logger: {debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn()},
}));

describe('trackAuthenticationError', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('forwards a retryable network failure as a log, because the user stays signed in and the retry handles it', () => {
        // Given the UNABLE_TO_RETRY path, which is a spotty connection rather than an auth failure
        trackAuthenticationError(new Error('Unable to retry Authenticate request'), {
            errorType: 'network_retry',
            functionName: 'reauthenticate',
            jsonCode: 407,
            command: 'OpenApp',
        });

        // Then it lands in Sentry logs and never in the error stream
        expect(Sentry.logger.warn).toHaveBeenCalledWith('[Authentication] network_retry', expect.objectContaining({command: 'OpenApp', errorMessage: 'Unable to retry Authenticate request'}));
        expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('keeps the tags on the log so a network_retry is still searchable by function and json code', () => {
        // Given a retryable network failure
        trackAuthenticationError(new Error('Unable to retry Authenticate request'), {
            errorType: 'network_retry',
            functionName: 'reauthenticate',
            jsonCode: 407,
            command: 'OpenApp',
        });

        // Then the attributes carry what the tags carried before
        const attributes = jest.mocked(Sentry.logger.warn).mock.calls.at(0)?.at(1);
        expect(attributes).toEqual(
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect.objectContaining({authentication_function: 'reauthenticate', authentication_error_type: 'network_retry', authentication_json_code: '407'}),
        );
    });

    it('still captures a real auth failure as an error event', () => {
        // Given an authentication failure that signs the user out
        const error = new Error('Authentication failed');
        trackAuthenticationError(error, {
            errorType: 'auth_failure',
            functionName: 'reauthenticate',
            jsonCode: 401,
            command: 'OpenApp',
            errorMessage: 'Session expired',
        });

        // Then it is reported as an exception, unchanged
        // eslint-disable-next-line @typescript-eslint/naming-convention
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.objectContaining({tags: expect.objectContaining({authentication_error_type: 'auth_failure'})}));
        expect(Sentry.logger.warn).not.toHaveBeenCalled();
    });

    it('still captures an unexpected error as an error event', () => {
        // Given an unexpected failure during authentication
        const error = new Error('boom');
        trackAuthenticationError(error, {errorType: 'unexpected_error', functionName: 'reauthenticate', command: 'OpenApp'});

        // Then it is reported as an exception
        expect(Sentry.captureException).toHaveBeenCalledWith(error, expect.anything());
        expect(Sentry.logger.warn).not.toHaveBeenCalled();
    });
});
