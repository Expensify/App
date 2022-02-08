#!/usr/bin/env node
const portfinder = require('portfinder');
const concurrently = require('concurrently');

const basePort = 8080;

portfinder.getPortPromise({
    port: basePort,
}).then((port) => {
    const processes = [
        {
            command: `webpack-dev-server --config config/webpack/webpack.dev.js --port ${port} --platform desktop`,
            name: 'Renderer',
            prefixColor: 'red.dim',

        },
        {
            command: `wait-port localhost:${port} && export NODE_ENV=development PORT=${port} \
            && electron desktop/main.js`,
            name: 'Main',
            prefixColor: 'cyan.dim',
        },
    ];
    concurrently(processes, {
        inputStream: process.stdin,
        prefix: 'name',

        // Like Harry Potter and he-who-must-not-be-named, "neither can live while the other survives"
        killOthers: ['success', 'failure'],
    }).then(
        () => process.exit(0),
        () => process.exit(1),
    );
}).catch(() => process.exit(1));
