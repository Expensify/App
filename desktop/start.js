#!/usr/bin/env node
const portfinder = require('portfinder');
const concurrently = require('concurrently');
require('dotenv').config();

const basePort = 8080;

portfinder.getPortPromise({
    port: basePort,
}).then((port) => {
    const devServer = `webpack-dev-server --config config/webpack/webpack.dev.js --port ${port} --env platform=desktop`;
    const buildMain = 'webpack watch --config config/webpack/webpack.desktop.js --config-name desktop-main --mode=development';

    const processes = [
        {
            command: buildMain,
            name: 'Main',
            prefixColor: 'blue.dim',
        },
        {
            command: devServer,
            name: 'Renderer',
            prefixColor: 'red.dim',
        },
        {
            command: `wait-port localhost:${port} && electron desktop/dist/main.js`,
            name: 'Electron',
            prefixColor: 'cyan.dim',
        },
    ];

    concurrently(processes, {
        inputStream: process.stdin,
        prefix: 'name',
        env: {
            PORT: port,
            NODE_ENV: 'development',
        },

        // Like Harry Potter and he-who-must-not-be-named, "neither can live while the other survives"
        killOthers: ['success', 'failure'],
    }).then(
        () => process.exit(0),
        () => process.exit(1),
    );
}).catch(() => process.exit(1));
