import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import type {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import ssrConfig from './webpack.ssr';

const serverConfig: Configuration = merge(ssrConfig, {
    mode: 'development',
    entry: path.resolve(__dirname, '..', '..', '..', 'emails', 'server', 'server.ts'),
    output: {
        filename: 'server.bundle.js',
        path: path.resolve(__dirname, '..', '..', '..', 'emails', 'dist'),
    },
    plugins: [
        // copy static files to dist/
        new CopyWebpackPlugin({
            patterns: [{from: 'static', to: 'static'}],
        }),
    ],
});

export default serverConfig;
