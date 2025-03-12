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
            // Load images inline as base64
            // TODO: to support outlook, we'd need the CLI config to use CID (content-id) images and send the images as attachments. For previewing in the browser and all other email clients, base64 images work. Note that CID images only work in email clients, not in the browser
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/inline',
            },
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
