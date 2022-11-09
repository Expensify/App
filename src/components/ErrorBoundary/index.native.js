import crashlytics from '@react-native-firebase/crashlytics';

import BaseErrorBoundary from './BaseErrorBoundary';
import Log from '../../libs/Log';
import CONFIG from '../../CONFIG';

BaseErrorBoundary.defaultProps.logError = (errorMessage, error, errorInfo) => {
    // Do not log JS crashes to crashlytics if we are on dev or local release builds.
    // They should only be sent on official staging or production versions of the app.
    if (!CONFIG.SEND_CRASH_REPORTS) {
        return;
    }

    // Log the error to the server
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);

    /* On native we also log the error to crashlytics
    * Since the error was handled we need to manually tell crashlytics about it */
    crashlytics().log(`errorInfo: ${errorInfo}`);
    crashlytics().recordError(error);
};

export default BaseErrorBoundary;
