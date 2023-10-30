import React from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import BootSplash from '@libs/BootSplash';
import GenericErrorPage from '@pages/ErrorPage/GenericErrorPage';

type LogError = (message: string, error: Error, errorInfo: string) => void;

type BaseErrorBoundaryProps = {
    /* A message posted to `logError` (along with error data) when this component intercepts an error */
    errorMessage: string;

    /* A function to perform the actual logging since different platforms support different tools */
    logError?: LogError;

    /* Actual content wrapped by this error boundary */
    children: React.ReactNode;
};
/**
 * This component captures an error in the child component tree and logs it to the server
 * It can be used to wrap the entire app as well as to wrap specific parts for more granularity
 * @see {@link https://reactjs.org/docs/error-boundaries.html#where-to-place-error-boundaries}
 */

function BaseErrorBoundary({logError = () => {}, errorMessage, children}: BaseErrorBoundaryProps) {
    const catchError = (error: Error, errorInfo: React.ErrorInfo) => {
        logError(errorMessage, error, JSON.stringify(errorInfo));
        // We hide the splash screen since the error might happened during app init
        BootSplash.hide();
    };

    return (
        <ErrorBoundary
            fallback={<GenericErrorPage />}
            onError={catchError}
        >
            {children}
        </ErrorBoundary>
    );
}

BaseErrorBoundary.displayName = 'BaseErrorBoundary';
export type {LogError, BaseErrorBoundaryProps};
export default BaseErrorBoundary;
