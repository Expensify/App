const {WebSocketServer} = require('ws');

const Commands = require('./commands');
const {SERVER_PORT} = require('../config');

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

/**
 * Starts a new WebSocket server. Returns an object with functions
 * representing commands that can be sent to the client.
 * @returns {Promise<Object>}
 */
const start = () => {
    const wss = new WebSocketServer({port: SERVER_PORT});

    return new Promise((resolveStart) => {
        wss.on('connection', (socket) => {
            console.debug('[SERVER]  A device connected');

            const newMessageListener = (callback) => {
                const listener = (data) => {
                    const strData = data.toString();
                    const objData = tryParseJSON(strData);
                    callback(objData, strData);
                };
                socket.addListener('message', listener);
                return () => socket.removeListener('message', listener);
            };

            const waitForSuccessResponse = command => new Promise((resolve) => {
                const cleanup = newMessageListener((data) => {
                    if (data == null || data.type !== 'status' || data.inputCommand !== command) {
                        return;
                    }
                    cleanup();
                    resolve();
                });
            });

            const sendAndWaitForSuccess = (command) => {
                socket.send(command);
                return waitForSuccessResponse(command);
            };

            const server = {
                login: () => sendAndWaitForSuccess(Commands.LOGIN),
                logout: () => sendAndWaitForSuccess(Commands.LOGOUT),
                waitForAppReady: () => sendAndWaitForSuccess(Commands.WAIT_FOR_APP_READY),
                stopServer: () => wss.close(),
            };
            resolveStart(server);
        });
    });
};

module.exports = start;
