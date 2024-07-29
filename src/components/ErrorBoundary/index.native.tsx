import crashlytics from '@react-native-firebase/crashlytics';
import React, {useEffect} from 'react';
import Log from '@libs/Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import type {BaseErrorBoundaryProps, LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);

    /* On native we also log the error to crashlytics
     * Since the error was handled we need to manually tell crashlytics about it */
    crashlytics().log(`errorInfo: ${errorInfo}`);
    crashlytics().recordError(error);
};

const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    let rejection: unknown = event.reason;
    if (event.reason instanceof Error) {
        Log.alert(`Unhandled Promise Rejection: ${event.reason.message}\nStack: ${event.reason.stack}`, {}, false);
        crashlytics().log(`errorInfo: ${event.reason.message}`);
        crashlytics().recordError(event.reason);
        return;
    }

    if (typeof event.reason === 'object' && event.reason !== null) {
        rejection = JSON.stringify(event.reason);
    }

    Log.alert(`Unhandled Promise Rejection: ${String(rejection)}`, {}, false);
    crashlytics().log(`errorInfo: ${String(rejection)}`);
    crashlytics().recordError(new Error(String(rejection)));
};

function ErrorBoundary({errorMessage, children}: Omit<BaseErrorBoundaryProps, 'logError'>) {
    // Log unhandled promise rejections to the server
    useEffect(() => {
        window.addEventListener('unhandledrejection', onUnhandledRejection);
        return () => window.removeEventListener('unhandledrejection', onUnhandledRejection);
    }, []);
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
