/**
 * Type name for commands that are understood among the app/client and the server.
 * @type {{LOGOUT: string, WAIT_FOR_APP_READY: string, LOGIN: string, REQUEST_PERFORMANCE_METRICS: string}}
 */
module.exports = {
    LOGIN: 'login',
    LOGOUT: 'logout',
    WAIT_FOR_APP_READY: 'waitForAppReady',
    REQUEST_PERFORMANCE_METRICS: 'requestPerformanceMetrics',
};
