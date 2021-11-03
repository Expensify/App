import Logger from 'expensify-common/lib/Logger';
import CONFIG from '../CONFIG';
import getPlatform from './getPlatform';
import {version} from '../../package.json';
import NetworkConnection from './NetworkConnection';
import HttpUtils from './HttpUtils';

// eslint-disable-next-line import/no-cycle
import * as API from './API';

let timeout = null;

/**
 * Network interface for logger.
 *
 * @param {Logger} logger
 * @param {Object} params
 * @param {Object} params.parameters
 * @param {String} params.message
 * @return {Promise}
 */
function serverLoggingCallback(logger, params) {
    const requestParams = params;
    requestParams.shouldProcessImmediately = false;
    requestParams.expensifyCashAppVersion = `expensifyCash[${getPlatform()}]${version}`;
    if (requestParams.parameters) {
        requestParams.parameters = JSON.stringify(params.parameters);
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => logger.info('Flushing logs older than 10 minutes', true, {}, true), 10 * 60 * 1000);
    return API.Log(requestParams);
}

// Note: We are importing Logger from expensify-common because it is
// used by other platforms. The server and client logging
// callback methods are passed in here so we can decouple
// the logging library from the logging methods.
const Log = new Logger({
    serverLoggingCallback,
    clientLoggingCallback: (message) => {
        console.debug(message);
    },
    isDebug: !CONFIG.IS_IN_PRODUCTION,
});

const logWarning = Log.warn;
const logAlert = Log.alert;

/**
 * Override Log.warn to only log a server error in production.
 *
 * @param {String} message
 * @param {String|Object} [parameters]
 * @throws {Error} on dev
 */
Log.warn = (message, parameters = '') => {
    if (!CONFIG.IS_IN_PRODUCTION) {
        throw new Error({
            message,
            ...parameters,
        });
    }
    logWarning(message, parameters);
};

/**
 * Override Log.alert to only log a server error in production.
 *
 * @param {String} message
 * @param {Object} [parameters]
 * @param {Boolean} [includeStackTrace]
 * @throws {Error} on dev
 */
Log.alert = (message, parameters = {}, includeStackTrace = true) => {
    if (!CONFIG.IS_IN_PRODUCTION) {
        throw new Error({
            message,
            ...parameters,
        });
    }
    logAlert(message, parameters, includeStackTrace);
};

timeout = setTimeout(() => Log.info('Flushing logs older than 10 minutes', true, {}, true), 10 * 60 * 1000);

NetworkConnection.registerLogInfoCallback(Log.info);
HttpUtils.setLogger(Log);

export default Log;
