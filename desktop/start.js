#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var concurrently_1 = require("concurrently");
var dotenv_1 = require("dotenv");
var portfinder_1 = require("portfinder");
(0, dotenv_1.config)();
var basePort = 8082;
portfinder_1.default
    .getPortPromise({
    port: basePort,
})
    .then(function (port) {
    var devServer = "webpack-dev-server --config config/webpack/webpack.dev.ts --port ".concat(port, " --env platform=desktop");
    var buildMain = 'webpack watch --config config/webpack/webpack.desktop.ts --config-name desktop-main --mode=development';
    var env = {
        PORT: port,
        NODE_ENV: 'development',
    };
    var processes = [
        {
            command: buildMain,
            name: 'Main',
            prefixColor: 'blue.dim',
            env: env,
        },
        {
            command: devServer,
            name: 'Renderer',
            prefixColor: 'red.dim',
            env: env,
        },
        {
            command: "wait-port dev.new.expensify.com:".concat(port, " && npx electronmon ./desktop/dev.js"),
            name: 'Electron',
            prefixColor: 'cyan.dim',
            env: env,
        },
    ];
    var result = (0, concurrently_1.default)(processes, {
        inputStream: process.stdin,
        prefix: 'name',
        // Like Harry Potter and he-who-must-not-be-named, "neither can live while the other survives"
        killOthers: ['success', 'failure'],
    }).result;
    return result.then(function () { return process.exit(0); }, function () { return process.exit(1); });
})
    .catch(function () { return process.exit(1); });
