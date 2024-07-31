import React, {useEffect} from 'react';
import Log from '@libs//Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import type {BaseErrorBoundaryProps, LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
};

const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    let rejection: unknown = event.reason;
    if (event.reason instanceof Error) {
        Log.alert(`Unhandled Promise Rejection: ${event.reason.message}\nStack: ${event.reason.stack}`, {}, false);
        return;
    }

    if (typeof event.reason === 'object' && event.reason !== null) {
        rejection = JSON.stringify(event.reason);
    }
    Log.alert(`Unhandled Promise Rejection: ${String(rejection)}`, {}, false);
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
