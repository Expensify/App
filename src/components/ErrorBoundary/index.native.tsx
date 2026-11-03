import React from 'react';

import type {BaseErrorBoundaryProps} from './types';

import BaseErrorBoundary from './BaseErrorBoundary';
import logError from './logError';

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
