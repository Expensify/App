import {getCrashlytics, log, recordError} from '@react-native-firebase/crashlytics';
import React from 'react';
import Log from '@libs/Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import type {BaseErrorBoundaryProps, LogError} from './types';

const crashlytics = getCrashlytics();

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);

    /* On native we also log the error to crashlytics
     * Since the error was handled we need to manually tell crashlytics about it */
    log(crashlytics, `errorInfo: ${errorInfo}`);
    recordError(crashlytics, error);
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
