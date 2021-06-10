import crashlytics from '@react-native-firebase/crashlytics';

import BaseErrorBoundary from './BaseErrorBoundary';
import Log from '../../libs/Log';

BaseErrorBoundary.defaultProps.logError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.info(this.props.errorMessage, true, {error, errorInfo});

    /* On native we also log the error to crashlytics
    * Since the error was handled we need to manually tell crashlytics about it */
    crashlytics().log(`errorInfo: ${errorInfo}`);
    crashlytics().recordError(error);
};

export default BaseErrorBoundary;
