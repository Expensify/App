import path from 'path';
import {DefinePlugin} from 'webpack';
import type {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from './webpack.base';

/**
 * Webpack configuration for server-side rendering emails.
 */
const emailsConfig: Configuration = merge(baseConfig({platform: 'ssr'}), {
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
    plugins: [
        new DefinePlugin({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'process.env.IS_SSR_BUILD': true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'isomorphic-style-loader-react18',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            modules: false,
                        },
                    },
                ],
            },
        ],
    },
});

export default emailsConfig;
