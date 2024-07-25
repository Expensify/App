import React, {useEffect} from 'react';
import Log from '@libs//Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import type {BaseErrorBoundaryProps, LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
};

const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    Log.alert(`Unhandled Promise Rejection: ${event.reason}`, {}, false);
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
