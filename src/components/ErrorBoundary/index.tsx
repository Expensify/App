import isBrowserExtensionError from '@libs/isBrowserExtensionError';
import Log from '@libs/Log';

import React, {useEffect} from 'react';

import type {BaseErrorBoundaryProps} from './types';

import BaseErrorBoundary from './BaseErrorBoundary';
import logError from './logError';

const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    let rejection: unknown = event.reason;
    if (event.reason instanceof Error) {
        // Each alert sends its own Log request, so an extension that keeps failing would flood the API with errors we can't fix
        if (isBrowserExtensionError(event.reason)) {
            return;
        }

        Log.hmmm(`Unhandled Promise Rejection: ${event.reason.message}\nStack: ${event.reason.stack}`);
        return;
    }

    if (typeof event.reason === 'object' && event.reason !== null) {
        rejection = JSON.stringify(event.reason);
    }
    Log.hmmm(`Unhandled Promise Rejection: ${String(rejection)}`);
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

export default ErrorBoundary;
