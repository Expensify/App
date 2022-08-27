const http = require('http');
const {WebSocket, WebSocketServer} = require('ws');

const wss = new WebSocketServer({
    port: 8888,
});

wss.on('connection', (ws) => {
    ws.on('message', (data) => {
        // eslint-disable-next-line rulesdir/prefer-early-return
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        });
    });
});

/**
 * Simulate Pusher HTTP API
 */
const server = http.createServer((req, res) => {
    // PHP requests with channel and data arrive
    let data = '';
    req.on('data', (chunk) => {
        data += chunk;
    });
    req.on('end', () => {
        // Send data to clients
        // eslint-disable-next-line rulesdir/prefer-early-return
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });

        // Return 200 to PHP web service and finish request
        res.writeHead(200);
        res.end();
    });
});

server.listen(9999);
