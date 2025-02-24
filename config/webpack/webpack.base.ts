/**
 * This file contains a base webpack config that's shared by:
 *
 * - NewDot web
 * - NewDot desktop
 * - NewDot's email renderer
 */
import {CleanWebpackPlugin} from 'clean-webpack-plugin';
import dotenv from 'dotenv';
import path from 'path';
import type {Configuration} from 'webpack';
import {DefinePlugin, IgnorePlugin, ProvidePlugin} from 'webpack';
import type Environment from './types';

dotenv.config();

const includeModules = [
    'react-native-animatable',
    'react-native-reanimated',
    'react-native-picker-select',
    'react-native-web',
    'react-native-webview',
    '@react-native-picker',
    'react-native-modal',
    'react-native-gesture-handler',
    'react-native-google-places-autocomplete',
    'react-native-qrcode-svg',
    'react-native-view-shot',
    '@react-native/assets',
    'expo',
    'expo-av',
    'expo-image-manipulator',
    'expo-modules-core',
].join('|');

/**
 * Get the platform-specific list of imported file extensions.
 *
 * React Native libraries may have web-specific module implementations that appear with the extension `.web.js`
 * without this, web will try to use native implementations and break in not very obvious ways.
 * This is also why we have to use .website.js for our own web-specific files...
 * Because desktop also relies on "web-specific" module implementations
 * This also skips packing web only dependencies to desktop and vice versa
 */
function getFileExtensions(platform: Environment['platform']) {
    const extensions = [
        '.web.js',
        ...(platform === 'desktop' ? ['.desktop.js'] : []),
        ...(platform === 'web' ? ['.website.js'] : []),
        '.js',
        '.jsx',
        '.web.ts',
        ...(platform === 'desktop' ? ['.desktop.ts'] : []),
        ...(platform === 'web' ? ['.website.ts'] : []),
        ...(platform === 'desktop' ? ['.desktop.tsx'] : []),
        ...(platform === 'web' ? ['website.tsx'] : []),
        '.ts',
        '.web.tsx',
        '.tsx',
    ];
    switch (platform) {
        case 'desktop':
            extensions.push('desktop.js', 'desktop.ts', 'desktop.tsx');
            break;
        case 'ssr':
            extensions.push('ssr.ts', 'ssr.tsx');
            break;
        case 'web':
        default:
            extensions.push('website.js', 'website.ts', 'website.tsx');
    }
    return extensions;
}

const getBaseConfiguration = ({file = '.env', platform = 'web'}: Environment): Configuration => ({
    mode: 'production',
    devtool: 'source-map',
    stats: {
        // We can ignore the "module not installed" warning from lottie-react-native
        // because we are not using the library for JSON format of Lottie animations.
        warningsFilter: ['./node_modules/lottie-react-native/lib/module/LottieView/index.web.js'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new ProvidePlugin({
            process: 'process/browser',
        }),
        new IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        ...(file === '.env.production' || file === '.env.staging'
            ? [
                  new IgnorePlugin({
                      resourceRegExp: /@welldone-software\/why-did-you-render/,
                  }),
              ]
            : []),
        new DefinePlugin({
            ...(platform === 'desktop' ? {} : {process: {env: {}}}),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __REACT_WEB_CONFIG__: JSON.stringify(dotenv.config({path: file}).parsed),

            // React Native JavaScript environment requires the global __DEV__ variable to be accessible.
            // react-native-render-html uses variable to log exclusively during development.
            // See https://reactnative.dev/docs/javascript-environment
            // eslint-disable-next-line @typescript-eslint/naming-convention
            __DEV__: /staging|prod|adhoc/.test(file) === false,
        }),
    ],
    module: {
        rules: [
            // Transpiles and lints all the JS
            {
                test: /\.(js|ts)x?$/,
                loader: 'babel-loader',
                options: {
                    configFile: path.resolve(__dirname, '../../babel.config.js'),
                },

                /**
                 * Exclude node_modules except any packages we need to convert for rendering HTML because they import
                 * "react-native" internally and use JSX which we need to convert to JS for the browser.
                 *
                 * You'll need to add anything in here that needs the alias for "react-native" -> "react-native-web"
                 * You can remove something from this list if it doesn't use "react-native" as an import and it doesn't
                 * use JSX/JS that needs to be transformed by babel.
                 */
                exclude: [new RegExp(`node_modules/(?!(${includeModules})/).*|.native.js$`)],
            },
            // Gives the ability to load local images
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset',
            },
            // Load svg images
            {
                test: /\.svg$/,
                resourceQuery: {not: [/raw/]},
                exclude: /node_modules/,
                use: [
                    {
                        loader: '@svgr/webpack',
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff|woff2)$/i,
                type: 'asset',
            },
            {
                resourceQuery: /raw/,
                type: 'asset/source',
            },
            {
                test: /\.lottie$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        alias: {
            lodash: 'lodash-es',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'react-native-config': 'react-web-config',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'react-native$': 'react-native-web',
            // Module alias for web & desktop
            // https://webpack.js.org/configuration/resolve/#resolvealias
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@assets': path.resolve(__dirname, '../../assets'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@components': path.resolve(__dirname, '../../src/components/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@hooks': path.resolve(__dirname, '../../src/hooks/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@libs': path.resolve(__dirname, '../../src/libs/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@navigation': path.resolve(__dirname, '../../src/libs/Navigation/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@pages': path.resolve(__dirname, '../../src/pages/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@styles': path.resolve(__dirname, '../../src/styles/'),
            // This path is provide alias for files like `ONYXKEYS` and `CONST`.
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@src': path.resolve(__dirname, '../../src/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@userActions': path.resolve(__dirname, '../../src/libs/actions/'),
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '@desktop': path.resolve(__dirname, '../../desktop'),
        },

        extensions: getFileExtensions(platform),
        fallback: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'process/browser': require.resolve('process/browser'),
            crypto: false,
        },
    },
});

export default getBaseConfiguration;
