import path from 'path';
import type {Configuration} from 'webpack';
import {IgnorePlugin} from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.base';

/**
 * Webpack configuration for server-side rendering emails.
 */
const emailsConfig: Configuration = merge(baseConfig({}), {
    mode: 'development',
    entry: '../emails/server.ts',
    output: {
        filename: 'server.bundle.js',
        path: path.resolve('../emails', 'dist'),
    },
    target: 'node',
    externals: {
        express: 'commonjs express',
    },
    optimization: {
        minimize: false,
        concatenateModules: false, // Ensures modules are not tree-shaken for easier debugging
    },
    watch: true,
});

export default emailsConfig;
