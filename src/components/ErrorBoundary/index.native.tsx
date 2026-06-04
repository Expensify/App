import React from 'react';
import BaseErrorBoundary from './BaseErrorBoundary';
import logError from './logError';
import type {BaseErrorBoundaryProps} from './types';

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
