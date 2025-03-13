import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import type {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import ssrConfig from './webpack.ssr';

/**
 * Configuration for the email rendering CLI
 */
const serverConfig: Configuration = merge(ssrConfig, {
    mode: 'production',
    entry: path.resolve(__dirname, '..', '..', '..', 'emails', 'cli', 'cli.ts'),
    output: {
        filename: 'cli.bundle.js',
        path: path.resolve(__dirname, '..', '..', '..', 'emails', 'cli', 'dist'),
    },
    plugins: [
        // copy static files to dist/
        new CopyWebpackPlugin({
            patterns: [{from: 'static', to: 'static'}],
        }),
    ],
});

export default serverConfig;
