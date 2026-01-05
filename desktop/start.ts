#!/usr/bin/env node
import concurrently from 'concurrently';
import {config as configDotenv} from 'dotenv';
import portfinder from 'portfinder';

configDotenv();

const basePort = 8082;

portfinder
    .getPortPromise({
        port: basePort,
    })
    .then((port) => {
        const devServer = `./scripts/start-dev-with-auto-restart.sh --port ${port} --env platform=desktop`;
        const buildMain = 'npx tsx ./node_modules/.bin/webpack-cli watch --config config/webpack/webpack.desktop.ts --config-name desktop-main --mode=development';

        const env = {
            PORT: port,
            NODE_ENV: 'development',
        };

        const processes = [
            {
                command: buildMain,
                name: 'Main',
                prefixColor: 'blue.dim',
                env,
            },
            {
                command: devServer,
                name: 'Renderer',
                prefixColor: 'red.dim',
                env,
            },
            {
                command: `wait-port dev.new.expensify.com:${port} && npx electronmon ./desktop/dev.js`,
                name: 'Electron',
                prefixColor: 'cyan.dim',
                env,
            },
        ];

        const {result} = concurrently(processes, {
            inputStream: process.stdin,
            prefix: 'name',

            // Like Harry Potter and he-who-must-not-be-named, "neither can live while the other survives"
            killOthers: ['success', 'failure'],
        });

        return result.then(
            () => process.exit(0),
            () => process.exit(1),
        );
    })
    .catch(() => process.exit(1));
