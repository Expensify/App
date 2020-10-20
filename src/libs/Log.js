import {log} from './API';

/**
 * Log an alert to the server.
 *
 * @param {String} message
 */
function logAlert(message, parameters = {}) {
    log({
        message: `[alrt] ${message}`,
        parameters,
    });
}

/**
 * Log an info to the server.
 *
 * @param {String} message
 */
function logInfo(message, parameters = {}) {
    log({
        message: `[info] ${message}`,
        parameters,
    });
}

export {
    logAlert,
    logInfo,
};
