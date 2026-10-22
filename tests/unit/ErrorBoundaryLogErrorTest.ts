// Regression coverage for app-blocking boundary errors and expected upgrade notifications.
import logError from '@components/ErrorBoundary/logError';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

jest.mock('@libs/Log', () => ({alert: jest.fn()}));

jest.mock('@sentry/react-native', () => ({
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
}));

const logMock = jest.requireMock<{alert: jest.Mock}>('@libs/Log');

describe('ErrorBoundary logError', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reports unexpected boundary errors as fatal, unhandled, and app-blocking', () => {
        // Given a render failure that replaces the main app with the generic error screen
        const error = new TypeError("Cannot read properties of undefined (reading 'userId')");
        const errorMessage = 'NewExpensify crash caught by error boundary';
        const errorInfo = JSON.stringify({componentStack: 'UpcomingTravelSection'});

        // When the root error boundary reports the failure
        logError(errorMessage, error, errorInfo);

        // Then Sentry can distinguish the app-blocking failure from a recoverable handled error
        expect(Sentry.captureException).toHaveBeenCalledTimes(1);
        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
            mechanism: {type: 'generic', handled: false},
            captureContext: {
                level: 'fatal',
                extra: {errorInfo},
                tags: {[CONST.TELEMETRY.TAGS.APP_BLOCKING]: 'true'},
            },
        });
        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({message: `errorInfo: ${errorInfo}`});
        expect(logMock.alert).toHaveBeenCalledWith(`${errorMessage} - ${error.message}`, {errorInfo}, false);
    });

    it('keeps update-required notifications out of Sentry while preserving server logging', () => {
        // Given an expected minimum-version notification rather than an unexpected app failure
        const error = new Error(CONST.ERROR.UPDATE_REQUIRED);
        const errorMessage = 'NewExpensify crash caught by error boundary';
        const errorInfo = JSON.stringify({componentStack: 'Expensify'});

        // When the error boundary reports the update-required notification
        logError(errorMessage, error, errorInfo);

        // Then no Sentry exception or breadcrumb is created, but the existing server log remains
        expect(Sentry.captureException).not.toHaveBeenCalled();
        expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
        expect(logMock.alert).toHaveBeenCalledWith(`${errorMessage} - ${CONST.ERROR.UPDATE_REQUIRED}`, {errorInfo}, false);
    });
});
