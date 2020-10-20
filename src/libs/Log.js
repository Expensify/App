import {logToServer} from './API';

const SOURCE_EXPENSIFY_CASH = 'expensify_cash';
const LEVEL = {
    INFO: 'info',
    ALERT: 'alrt',
    WARN: 'warn',
    HMMM: 'hmmm',
};

/**
* Ask the server to write the log message
*
* @param {String} message The message to write
* @param {Object|String} parameters The parameters to send along with the message
*/
function sendLogs(message, parameters = {}) {
    logToServer({
        parameters,
        message,
        source: SOURCE_EXPENSIFY_CASH,
    });
}

/**
* Sends an informational message to the logs.
*
* @param {String} message The message to log.
* @param {Object|String} parameters The parameters to send along with the message
*/
function info(message, parameters) {
    sendLogs(`[${LEVEL.INFO}] ${message}`, parameters);
}

/**
 * Logs an alert.
 *
 * @param {String} message The message to alert.
 * @param {Object|String} parameters The parameters to send along with the message
 */
function alert(message, parameters = {}) {
    const msg = `[${LEVEL.ALERT}] ${message}`;
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
function warn(message, parameters) {
    sendLogs(`[${LEVEL.WARN}] ${message}`, parameters);
}

/**
 * Logs a hmmm.
 *
 * @param {String} message The message to hmmm.
 * @param {Object|String} parameters The parameters to send along with the message
 */
function hmmm(message, parameters) {
    sendLogs(`[${LEVEL.HMMM}] ${message}`, parameters);
}

export default {
    LEVEL,
    alert,
    info,
    hmmm,
    warn,
};
