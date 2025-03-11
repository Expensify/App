import path from 'path';
import type {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.base';

process.env.IS_SSR_BUILD = 'true';

/**
 * Webpack configuration for server-side rendering emails.
 */
const ssrConfig: Configuration = merge(baseConfig({platform: 'ssr'}), {
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
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                            importLoaders: 1,
                        },
                    },
                ],
            },
        ],
    },
});

export default ssrConfig;
