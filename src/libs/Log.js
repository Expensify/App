import Logger from 'js-libs/lib/Logger';
import {logToServer} from './API';
import getPlatform from './getPlatform';
import CONFIG from '../CONFIG';

/**
 * Network interface for logger.
 *
 * @param {Object} params
 * @param {Object} params.parameters
 * @param {String} params.message
 */
function serverLoggingCallback(params) {
    logToServer({
        ...params,
        expensifyCashAppVersion: `${getPlatform()}`,
    });
}

export default new Logger({
    serverLoggingCallback,
    clientLoggingCallback: (message) => {
        console.debug(message);
    },
    isDebug: !CONFIG.IS_IN_PRODUCTION,
});
