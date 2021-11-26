import crashlytics from '@react-native-firebase/crashlytics';

import BaseErrorBoundary from './BaseErrorBoundary';
import BootSplash from '../../libs/BootSplash';
import Log from '../../libs/Log';

BaseErrorBoundary.defaultProps.onError = (errorMessage, error, errorInfo) => {
    // Log the error to the server
    Log.alert(errorMessage, {error: error.message, errorInfo}, false);

    /* On native we also log the error to crashlytics
    * Since the error was handled we need to manually tell crashlytics about it */
    crashlytics().log(`errorInfo: ${JSON.stringify(errorInfo)}`);
    crashlytics().recordError(error);

    // We hide the splash screen since the error might happened during app init
    BootSplash.hide({fade: true});
};

export default BaseErrorBoundary;
