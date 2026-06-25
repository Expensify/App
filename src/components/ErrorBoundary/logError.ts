import * as Sentry from '@sentry/react-native';
import Log from '@libs/Log';
import type {LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
    Sentry.addBreadcrumb({message: `errorInfo: ${errorInfo}`});
    Sentry.captureException(error, {extra: {errorInfo}});
};

export default logError;
