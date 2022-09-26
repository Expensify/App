/* eslint-disable @lwc/lwc/no-async-await */
const {WebSocketServer} = require('ws');

const Commands = require('./commands');
const {SERVER_PORT} = require('../config');
const Logger = require('../utils/logger');
const tryParseJSON = require('./utils/tryParseJSON');
const withFailTimeout = require('./utils/withFailTimeout');

/**
 * Starts a new WebSocket server. Returns an object with functions
 * representing commands that can be sent to the client.
 * @returns {Object}
 * @property {Function} waitForAppReady - Resolves when the app is ready
 * @property {Function} login - Logs in a user
 * @property {Function} logout - Logs out the current user
 * @property {Function} getPerformanceMetrics - Returns an array of performance metrics
 * @property {Function} stopServer - Stops the created testing server instance
 */
const start = () => {
    const wss = new WebSocketServer({port: SERVER_PORT});

    // when the device connects we use this socket instance
    let socketInstance;
    let waitForSocketResolve;

    // promise for waiting until a socket instance is available ( a device connected )
    let waitForSocketPromise = new Promise((resolve) => {
        waitForSocketResolve = resolve;
    });

    // helper to remove the current socket instance (used when test kills the app)
    const clearSession = () => {
        socketInstance = null;
        waitForSocketPromise = new Promise((resolve) => {
            waitForSocketResolve = resolve;
        });
    };

    // on connection set the socket instance:
    wss.on('connection', (socket) => {
        Logger.log('[SERVER]  A device connected');

        socketInstance = socket;
        waitForSocketResolve();
    });

    // helper that adds a listener for incoming messages
    const newMessageListener = (callback) => {
        const listener = (data) => {
            const strData = data.toString();
            const objData = tryParseJSON(strData);
            callback(objData, strData);
        };
        socketInstance.addListener('message', listener);
        return () => socketInstance.removeListener('message', listener);
    };

    const sendData = (data) => {
        socketInstance.send(JSON.stringify(data));
    };

    /**
     * Returns a promise that will resolve/reject once we
     * receive a `{ type: 'status' }` response from the client.
     * @param {String} command {@link Commands}
     * @returns {Promise<void>}
     */
    const waitForResponse = command => new Promise((resolve, reject) => {
        const cleanup = newMessageListener((data) => {
            if (data == null || data.type !== 'status' || data.inputCommand !== command) {
                return;
            }
            cleanup();
            Logger.log(`[SERVER]  Received response for command: ${command}`);
            if (data.status === 'success') {
                resolve();
            } else {
                reject();
            }
        });
    });

    /**
     * Sends a command once we got a socket instance,
     * and waits for a success response.
     *
     * @param {String} command {@link Commands}
     * @param {Object} [data]
     * @returns {Promise<void>}
     */
    const sendAndWaitForResponse = async (command, data) => {
        await waitForSocketPromise;
        Logger.log(`[SERVER]  Sending command: ${command}`);
        sendData({type: command, data});
        return waitForResponse(command);
    };

    /**
     * Waits for socket instance, and then tries to collect
     * performance metrics from the app.
     * @returns {Promise<void>}
     */
    const getPerformanceMetrics = async () => {
        await waitForSocketPromise;
        return new Promise((resolve) => {
            const cleanup = newMessageListener((data) => {
                if (data == null || data.type !== 'performance_metrics') {
                    return;
                }
                if (data.metrics == null) {
                    console.error('[SERVER]  Received performance metrics but no metrics were included!');
                    return;
                }
                cleanup();
                resolve(data.metrics);
            });
            sendData({type: Commands.REQUEST_PERFORMANCE_METRICS});
        });
    };

    return {
        // command for app:
        login: (email, password) => withFailTimeout(sendAndWaitForResponse(Commands.LOGIN, {email, password}), Commands.LOGIN),
        logout: () => withFailTimeout(sendAndWaitForResponse(Commands.LOGOUT), Commands.LOGOUT),
        waitForAppReady: () => withFailTimeout(sendAndWaitForResponse(Commands.WAIT_FOR_APP_READY), Commands.WAIT_FOR_APP_READY),
        getPerformanceMetrics: () => withFailTimeout(getPerformanceMetrics(), Commands.REQUEST_PERFORMANCE_METRICS),

        // server interactions:
        stopServer: () => wss.close(),
        clearSession: () => clearSession(),
    };
};

module.exports = start;
