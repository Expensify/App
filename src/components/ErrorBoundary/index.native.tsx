import * as Sentry from '@sentry/react-native';
import React from 'react';
import Log from '@libs/Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import type {BaseErrorBoundaryProps, LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);

    /* On native we also log the error to Sentry.
     * Since the error was handled we need to manually tell Sentry about it. */
    Sentry.addBreadcrumb({message: `errorInfo: ${errorInfo}`});
    Sentry.captureException(error, {extra: {errorInfo}});
};

function ErrorBoundary({errorMessage, children}: Omit<BaseErrorBoundaryProps, 'logError'>) {
    return (
        <BaseErrorBoundary
            errorMessage={errorMessage}
            logError={logError}
        >
            {children}
        </BaseErrorBoundary>
    );
}

export default ErrorBoundary;
