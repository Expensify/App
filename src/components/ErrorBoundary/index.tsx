import React from 'react';
import Log from '@libs//Log';
import BaseErrorBoundary from './BaseErrorBoundary';
import {BaseErrorBoundaryProps, LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
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
