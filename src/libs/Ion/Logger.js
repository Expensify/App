// Logging callback
let logger;

/**
 * Register the logging callback
 *
 * @param {Function} callback
 */
function registerLogger(callback) {
    logger = callback;
}

/**
 * Send an alert message to the logger
 *
 * @param {String} message
 */
function logAlert(message) {
    logger({message: `[Ion] ${message}`, level: 'alert'});
}

/**
 * Send an info message to the logger
 *
 * @param {String} message
 */
function logInfo(message) {
    logger({message: `[Ion] ${message}`, level: 'info'});
}

export {
    registerLogger,
    logInfo,
    logAlert,
};
