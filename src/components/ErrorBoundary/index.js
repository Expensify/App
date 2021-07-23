import BaseErrorBoundary from './BaseErrorBoundary';
import Log from '../../libs/Log';

BaseErrorBoundary.defaultProps.logError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(errorMessage, {error: error.message, errorInfo}, false);
};
window.Log = Log;
export default BaseErrorBoundary;
