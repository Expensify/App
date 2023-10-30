import BaseErrorBoundary, {LogError, BaseErrorBoundaryProps} from './BaseErrorBoundary';
import Log from '@libs//Log';

const logError: LogError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
};

function ErrorBoundary({errorMessage, children}: BaseErrorBoundaryProps) {
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
