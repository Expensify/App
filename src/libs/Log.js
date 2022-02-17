// Making an exception to this rule here since we don't need an "action" for Log and Log should just be used directly. Creating a Log
// action would likely cause confusion about which one to use. But most other API methods should happen inside an action file.
/* eslint-disable rulesdir/no-api-in-views */
import Logger from 'expensify-common/lib/Logger';
import getPlatform from './getPlatform';
import {version} from '../../package.json';
import requireParameters from './requireParameters';
import * as Network from './Network';

let timeout = null;

/**
 * @param {Object} parameters
 * @param {String} parameters.expensifyCashAppVersion
 * @param {Object[]} parameters.logPacket
 * @returns {Promise}
 */
function LogCommand(parameters) {
    const commandName = 'Log';
    requireParameters(['logPacket', 'expensifyCashAppVersion'],
        parameters, commandName);

    // Note: We are forcing Log to run since it requires no authToken and should only be queued when we are offline.
    return Network.post(commandName, {...parameters, forceNetworkRequest: true, canAbort: false});
}

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
    return LogCommand(requestParams);
}

// Note: We are importing Logger from expensify-common because it is used by other platforms. The server and client logging
// callback methods are passed in here so we can decouple the logging library from the logging methods.
const Log = new Logger({
    serverLoggingCallback,
    clientLoggingCallback: (message) => {
        console.debug(message);
    },
    isDebug: true,
});
timeout = setTimeout(() => Log.info('Flushing logs older than 10 minutes', true, {}, true), 10 * 60 * 1000);

export default Log;
