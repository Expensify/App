const net = require('net');

function checkPort(port, host) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once('error', (err) => {
            if (err.code !== 'EADDRINUSE') {
                return reject(err);
            }

            reject(err);
        });
        server.once('listening', () => {
            server.once('close', () => resolve(false));
            server.close();
        });
        server.listen(port, host);
    });
}

const inputPort = Number(process.argv.slice(2)[0]);
if (Number.isNaN(inputPort) || inputPort < 0 || inputPort > 65535) {
    console.error('This command requires an argument that must be a number [0-65535]\n');
    process.exit(1);
}

Promise.all([
    checkPort(inputPort, 'localhost'),
    checkPort(inputPort, '127.0.0.1'),
    checkPort(inputPort, '0.0.0.0'),
])
    .then(() => process.exit(0))
    .catch(() => {
        console.error(
            `The port ${inputPort} is currently in use.`,
            `You can run \`lsof -i :${inputPort}\` to see which program is using it.\n`,
        );
        process.exit(1);
    });
