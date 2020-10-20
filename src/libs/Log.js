import {logToServer} from './API';
import getPlatform from './getPlatform';

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
        message,
        parameters: {
            ...parameters,
            platform: getPlatform(),
        },
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
    sendLogs(`${message}`, parameters);
}

/**
 * Logs an alert.
 *
 * @param {String} message The message to alert.
 * @param {Object|String} parameters The parameters to send along with the message
 */
function alert(message, parameters) {
    sendLogs(`[${LEVEL.ALERT}] ${message}`, parameters);
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
