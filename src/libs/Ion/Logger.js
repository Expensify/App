// Holds all logging callbacks
const loggers = [];

/**
 * Reister a logger
 *
 * @param {Function} callback
 */
function registerLogger(callback) {
    loggers.push(callback);
}

/**
 * Send a log message to any loggers
 *
 * @param {String} message
 */
function log(message) {
    _.each(loggers, (logger) => {
        logger(message);
    });
}

export default {
    registerLogger,
    log,
}
