import e2eLogin from './appCommands/e2eLogin';
import * as Session from '../actions/Session';
import * as Commands from '../../../e2e/server/commands';
import * as Config from '../../../e2e/config';

// TODO: introduced a require cycle
import Performance from '../Performance';

// Connect to the websocket running on the host machine
const ws = new WebSocket(`ws://localhost:${Config.SERVER_PORT}`); // TODO: this url breaks on platform when using emulators / android - get ip address

// a promise that resolves once we are connected with the server.
const connectPromise = new Promise((resolve) => {
    ws.onerror = (error) => {
        console.debug('[CLIENT] Error connecting to server:', error.message);
    };
    ws.onclose = () => {
        console.debug('[CLIENT] Connection to server closed');
    };
    ws.onopen = () => {
        console.debug('[CLIENT] Connected to server');
        resolve();
    };
});

// Common function for sending data to the server. Will only try to send when connected.
const sendData = (data) => {
    connectPromise.then(() => {
        ws.send(JSON.stringify(data));
    });
};

// Send a status update back to the server.
// Status updates are responses to commands send by the server.
const sendStatus = (inputCommand, status) => {
    sendData({
        status,
        inputCommand,
        type: 'status',
    });
};

// Wrapper for executing async actions and sending a status update back to the server.
const executeWithStatus = (command, promise) => {
    promise
        .then(() => sendStatus(command, 'success'))
        .catch(() => sendStatus(command, 'error'));
};

let isAppSessionReadyResolve;
const isAppSessionReady = new Promise((resolve) => {
    isAppSessionReadyResolve = resolve;
});

const markAppReady = () => {
    isAppSessionReadyResolve();
};

const listenForServerCommands = () => {
    // The app receiving commands from the server
    ws.onmessage = (event) => {
        if (event.data == null) {
            return;
        }

        const commandStr = event.data.toString();
        const command = JSON.parse(commandStr);
        const commandType = command.type;
        switch (commandType) {
            case Commands.LOGIN: {
                // expect data.email and data.password
                const {
                    email,
                    password,
                } = command.data;
                executeWithStatus(commandType, e2eLogin(email, password));
                break;
            }
            case Commands.LOGOUT:
                Session.signOutAndRedirectToSignIn();
                sendStatus(commandType, 'success');
                break;
            case Commands.WAIT_FOR_APP_READY:
                isAppSessionReady.then(() => sendStatus(commandType, 'success'));
                break;
            case Commands.REQUEST_PERFORMANCE_METRICS: {
                console.debug('[CLIENT]  Received request for performance metrics');
                const metrics = Performance.getPerformanceMetrics();
                sendData({
                    type: 'performance_metrics',
                    metrics,
                });
                console.debug('[CLIENT]  Sent performance metrics');
                break;
            }
            default:
                console.debug('Unknown command', event.data);
        }
    };
};

export {
    listenForServerCommands,
    sendData,
    markAppReady,
};
