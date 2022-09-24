/* eslint-disable @lwc/lwc/no-async-await */
const {WebSocketServer} = require('ws');

const Commands = require('./commands');
const {SERVER_PORT} = require('../config');
const Logger = require('../utils/logger');

const tryParseJSON = (jsonString) => {
    try {
        const o = JSON.parse(jsonString);
        if (o && typeof o === 'object') {
            return o;
        }
    } catch (e) {
        // ignore
    }
};

const INTERACTION_TIMEOUT = 20_000;

const withFailTimeout = (promise, name) => {
    const timeoutId = setTimeout(() => {
        throw new Error(`[${name}] Interaction timed out`);
    }, INTERACTION_TIMEOUT);
    return promise.finally(() => clearTimeout(timeoutId));
};

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
    let socketInstance;
    let waitForSocketResolve;
    let waitForSocketPromise = new Promise((resolve) => {
        waitForSocketResolve = resolve;
    });

    const clearSession = () => {
        socketInstance = null;
        waitForSocketPromise = new Promise((resolve) => {
            waitForSocketResolve = resolve;
        });
    };

    wss.on('connection', (socket) => {
        Logger.log('[SERVER]  A device connected');

        socketInstance = socket;
        waitForSocketResolve();
    });

    const newMessageListener = (callback) => {
        const listener = (data) => {
            const strData = data.toString();
            const objData = tryParseJSON(strData);
            callback(objData, strData);
        };
        socketInstance.addListener('message', listener);
        return () => socketInstance.removeListener('message', listener);
    };

    const waitForSuccessResponse = command => new Promise((resolve) => {
        const cleanup = newMessageListener((data) => {
            if (data == null || data.type !== 'status' || data.inputCommand !== command) {
                return;
            }
            cleanup();
            Logger.log(`[SERVER]  Received response for command: ${command}`);
            resolve();
        });
    });

    const sendAndWaitForSuccess = async (command) => {
        await waitForSocketPromise;
        Logger.log(`[SERVER]  Sending command: ${command}`);
        socketInstance.send(command);
        return waitForSuccessResponse(command);
    };

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
            socketInstance.send(Commands.REQUEST_PERFORMANCE_METRICS);
        });
    };

    return {
        // command for app:
        login: () => withFailTimeout(sendAndWaitForSuccess(Commands.LOGIN), Commands.LOGIN),
        logout: () => withFailTimeout(sendAndWaitForSuccess(Commands.LOGOUT), Commands.LOGOUT),
        waitForAppReady: () => withFailTimeout(sendAndWaitForSuccess(Commands.WAIT_FOR_APP_READY), Commands.WAIT_FOR_APP_READY),
        getPerformanceMetrics: () => withFailTimeout(getPerformanceMetrics(), Commands.REQUEST_PERFORMANCE_METRICS),

        // server interactions:
        stopServer: () => wss.close(),
        clearSession: () => clearSession(),
    };
};

module.exports = start;
