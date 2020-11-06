import Logger from 'js-libs/lib/Logger';
import {logToServer} from './API';
import CONFIG from '../CONFIG';
import getPlatform from './getPlatform';
import {version} from '../../package.json';
import Ion from './Ion';
import IONKEYS from '../IONKEYS';

let email;
Ion.connect({
    key: IONKEYS.SESSION,
    callback: val => email = val ? val.email : null,
});

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

    // If we are logging something and have no email
    // then we do not want to include this. If we pass
    // this as null or undefined that will literally
    // appear in the logs instead of we@dont.know
    if (email) {
        requestParams.email = email;
    }

    logToServer(requestParams);
}

// Note: We are importing Logger from JS-Libs because it is
// used by other platforms. The server and client logging
// callback methods are passed in here so we can decouple
// the logging library from the logging methods.
export default new Logger({
    serverLoggingCallback,
    clientLoggingCallback: (message) => {
        console.debug(message);
    },
    isDebug: !CONFIG.IS_JEST_RUNNING && !CONFIG.IS_IN_PRODUCTION,
});
