import BaseErrorBoundary from './BaseErrorBoundary';
import Log from '../../libs/Log';

BaseErrorBoundary.defaultProps.logError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.info(errorMessage, true, {error, errorInfo});
};

export default BaseErrorBoundary;
