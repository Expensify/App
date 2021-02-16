import Logger from 'expensify-common/lib/Logger';
import * as API from './API';
import CONFIG from '../CONFIG';
import getPlatform from './getPlatform';
import {version} from '../../package.json';
import NetworkConnection from './NetworkConnection';

/**
 * Network interface for logger.
 *
 * @param {Object} params
 * @param {Object} params.parameters
 * @param {String} params.message
 */
function serverLoggingCallback(params) {
    const requestParams = {
        message: params.message,
        parameters: JSON.stringify(params.parameters || {}),
        expensifyCashAppVersion: `expensifyCash[${getPlatform()}]${version}`,
    };

    API.Log(requestParams);
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

NetworkConnection.registerLogInfoCallback(Log.info);
export default Log;
