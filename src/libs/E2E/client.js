import e2eLogin from './appCommands/e2eLogin';
import * as Session from '../actions/Session';

// Connect to the websocket running on the host machine
const ws = new WebSocket('ws://localhost:3000'); // TODO: this url breaks on platform when using emulators / android - get ip address

// a promise that resolves once we are connected with the server.
const connectPromise = new Promise((resolve) => {
    ws.onopen = () => {
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

const listenForServerCommands = () => {
    // The app receiving commands from the server
    ws.onmessage = (event) => {
        if (event.data == null) {
            return;
        }

        // expect only string messages
        const command = event.data.toString();
        switch (command) {
            case 'login':
                executeWithStatus(command, e2eLogin());
                break;
            case 'logout':
                Session.signOutAndRedirectToSignIn();
                sendStatus(command, 'success');
                break;
            default:
                console.debug('Unknown command', event.data);
        }
    };
};

export {
    listenForServerCommands,
    sendData,
};
