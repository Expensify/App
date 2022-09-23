const {WebSocketServer} = require('ws');

const port = 3000;
const wss = new WebSocketServer({port});

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

// we need to "await" a connection with in a time frame, otherwise, fail
wss.on('connection', (socket) => {
    console.debug('a device connected');

    socket.on('message', (data) => {
        const strData = data.toString();
        const objData = tryParseJSON(strData);

        // we got a simple string command
        if (strData === 'cmdRestartApp') {
            console.debug('got restart command');
        } else {
            console.debug('got unknown command', strData, objData);
        }
    });

    // socket.on((error) => {
    //     console.debug('Client websocket error', error);
    // });
});

console.debug(`websocket server listening on port ${port}`);
