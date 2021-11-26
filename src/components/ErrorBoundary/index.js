import BaseErrorBoundary from './BaseErrorBoundary';
import Log from '../../libs/Log';

BaseErrorBoundary.defaultProps.onError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(errorMessage, {error: error.message, errorInfo}, false);
};
export default BaseErrorBoundary;
