import Log from '@libs/Log';

import CONST from '@src/CONST';

import * as Sentry from '@sentry/react-native';

import type {LogError} from './types';

const logError: LogError = (errorMessage, error, errorInfo) => {
    Log.alert(`${errorMessage} - ${error.message}`, {errorInfo}, false);
    if (error.message === CONST.ERROR.UPDATE_REQUIRED) {
        return;
    }

    Sentry.addBreadcrumb({message: `errorInfo: ${errorInfo}`});
    // The root boundary replaces the app with a blocking fallback, so catching the error does not mean the app recovered.
    Sentry.captureException(error, {
        mechanism: {type: 'generic', handled: false},
        captureContext: {
            level: 'fatal',
            extra: {errorInfo},
            tags: {[CONST.TELEMETRY.TAGS.APP_BLOCKING]: 'true'},
        },
    });
};

export default logError;
