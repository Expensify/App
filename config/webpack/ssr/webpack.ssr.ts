import path from 'path';
import type {Configuration} from 'webpack';
import {merge} from 'webpack-merge';
import baseConfig from '../webpack.base';

process.env.IS_SSR_BUILD = 'true';

/**
 * Webpack configuration for server-side rendering emails.
 */
const ssrConfig: Configuration = merge(baseConfig({platform: 'ssr'}), {
    target: 'node',
    externals: {
        express: 'commonjs express',
    },
    optimization: {
        minimize: false,
        concatenateModules: false, // Ensures modules are not tree-shaken for easier debugging
    },
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
    resolve: {
        alias: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'react-native-safe-area-context': path.resolve(__dirname, '..', '..', '..', 'emails', 'stubs', 'react-native-safe-area-context.tsx'),
        },
    },
});

export default ssrConfig;
