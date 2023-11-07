import crashlytics from '@react-native-firebase/crashlytics';
import React from 'react';
import Log from '@libs/Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import {BaseErrorBoundaryProps, LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);

    /* On native we also log the error to crashlytics
     * Since the error was handled we need to manually tell crashlytics about it */
    crashlytics().log(`errorInfo: ${errorInfo}`);
    crashlytics().recordError(error);
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

ErrorBoundary.displayName = 'ErrorBoundary';

export default ErrorBoundary;
