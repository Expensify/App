import Logger from 'expensify-common/lib/Logger';
import Onyx from 'react-native-onyx';
import * as API from './API';
import CONFIG from '../CONFIG';
import ONYXKEYS from '../ONYXKEYS';

let email;
Onyx.connect({
    key: ONYXKEYS.SESSION,
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
    API.Log([email, ...params]);
}

// Note: We are importing Logger from expensify-common because it is
// used by other platforms. The server and client logging
// callback methods are passed in here so we can decouple
// the logging library from the logging methods.
export default new Logger({
    serverLoggingCallback,
    clientLoggingCallback: (message) => {
        console.debug(message);
    },
    isDebug: !CONFIG.IS_IN_PRODUCTION,
});
