import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import type {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import ssrConfig from './webpack.ssr';

/**
 * Configuration for the email preview development server
 */
const serverConfig: Configuration = merge(ssrConfig, {
    mode: 'development',
    entry: path.resolve(__dirname, '..', '..', '..', 'emails', 'server', 'server.ts'),
    output: {
        filename: 'server.bundle.js',
        path: path.resolve(__dirname, '..', '..', '..', 'emails', 'server', 'dist'),
    },
    plugins: [
        // copy static files to dist/
        new CopyWebpackPlugin({
            patterns: [{from: 'server/static', to: 'static'}],
        }),
    ],
});

export default serverConfig;
