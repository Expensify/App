import Log from '@libs/Log';
import BaseErrorBoundary from './BaseErrorBoundary';

BaseErrorBoundary.defaultProps.logError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
};
export default BaseErrorBoundary;
