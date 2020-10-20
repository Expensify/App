import {logToServer} from './API';

/**
* Ask the server to write the log message
*
* @param {String} message The message to write
* @param {Object|String} parameters The parameters to send along with the message
*/
function sendLogs(message, parameters = {}) {
    logToServer({parameters, message});
}

/**
* Sends an informational message to the logs.
*
* @param {String} message The message to log.
* @param {Object|String} parameters The parameters to send along with the message
*/
function logInfo(message, parameters){
    sendLogs(`[info] ${message}`, parameters);
}

/**
 * Logs an alert.
 *
 * @param {String} message The message to alert.
 * @param {Object|String} parameters The parameters to send along with the message
 */
function logAlert(message, parameters = {}) {
    const msg = `[alrt] ${message}`;
    const params = parameters;
    params.stack = JSON.stringify(new Error().stack);
    sendLogs(msg, params);
}

/**
 * Logs a warn.
 *
 * @param {String} message The message to warn.
 * @param {Object|String} parameters The parameters to send along with the message
 */
function logWarn(message, parameters) {
    sendLogs(`[warn] ${message}`, parameters);
}

/**
 * Logs a hmmm.
 *
 * @param {String} message The message to hmmm.
 * @param {Object|String} parameters The parameters to send along with the message
 */
function logHmmm(message, parameters) {
    sendLogs(`[hmmm] ${message}`, parameters);
}

export {
    logAlert,
    logInfo,
    logHmmm,
    logWarn,
};
