// simple nodeJS http server that has a /status route

const {execSync} = require('child_process');
const http = require('http');

// Start server on the following ports: '8089', '3000', '4723', '4724'
const PORTS_TO_TRY = ['8089', '3000'];
PORTS_TO_TRY.forEach((port) => {
    const server = http.createServer((req, res) => {
        if (req.url === '/status') {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('OK');
            console.debug('i got called!!', port);
        } else {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('Not Found');
        }
    });

    server.listen(port, () => {
        console.debug(`Server running at http://localhost:${port}/`);
    });
});

// ip address:
const networkInterfaces = require('node:os').networkInterfaces();

// eslint-disable-next-line rulesdir/prefer-underscore-method
const ip = (networkInterfaces.en0 || networkInterfaces.eth0).find(i => i.family === 'IPv4').address;

// start app "com.expensify.chat" using adb
// execSync(`adb shell am start -n com.expensify.chat/com.expensify.chat.MainActivity -e "hostip" "${ip}"`);

