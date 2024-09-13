/* eslint-disable no-underscore-dangle */

/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-explicit-any */
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import {DefinePlugin} from 'webpack';
import type {Configuration} from 'webpack';

const projectRoot = path.resolve(__dirname, '../../');
const __DEV__ = true;

const resolveAll = (targetPath: any, matcher: any) => {
    let folders = fs
        .readdirSync(path.resolve(projectRoot, targetPath))
        .map((folder) => `${path.resolve(projectRoot, targetPath)}/${folder}`)
        .filter((folder) => fs.statSync(folder).isDirectory());
    if (matcher) {
        folders = folders.filter((folder) => folder.includes(matcher));
    }
    return folders;
};

const include = [path.resolve(projectRoot, 'index.js'), path.resolve(projectRoot, 'src'), ...resolveAll('node_modules', '/react-native')];

const babelLoaderConfiguration = {
    test: /\.(js|ts|tsx|jsx|cjs)$/,
    exclude: /node_modules/,
    // Add every directory that needs to be compiled by Babel during the build.
    include,
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true,
            // The 'metro-react-native-babel-preset' preset is recommended to match
            // React Native's packager presets:
            // ["module:metro-react-native-babel-preset"], Re-write paths to import
            // only the modules needed by the app
            plugins: [
                'react-native-web',
                '@babel/plugin-transform-export-namespace-from',
                '@babel/plugin-transform-flow-strip-types',
                '@babel/plugin-transform-class-properties',
                '@babel/plugin-transform-private-property-in-object',
                ['@babel/plugin-transform-block-scoping'],
                require.resolve('react-refresh/babel'),
                'react-native-reanimated/plugin',
            ].filter(Boolean),
            presets: [
                [
                    '@babel/preset-env',
                    {
                        corejs: {version: 3, proposals: true},
                        targets: {
                            browsers: ['last 2 versions', 'edge 18'],
                            node: '20.9.0',
                        },
                    },
                ],
                '@babel/preset-react',
                '@babel/preset-typescript',
                'module:metro-react-native-babel-preset',
            ],
        },
    },
};

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
    'expo-av',
].join('|');

process.env.NODE_ENV = 'development';
/**
 * Configuration for the local dev server
 */
const getConfiguration = (): Configuration => {
    const config: Configuration = {
        resolve: {
            extensions: ['.web.ts', '.ts', '.web.tsx', '.tsx', '.web.js', '.js'],
        },
        entry: {
            main: ['./index.js'],
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    loader: 'babel-loader',

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
            ],
        },

        mode: 'development',
        devtool: 'inline-source-map',
        // @ts-expect-error sds
        devServer: {
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                },
            },
            compress: true,
            historyApiFallback: true,
            hot: true,
        },
        plugins: [
            new DefinePlugin({
                __DEV__,
            }),
            new HtmlWebpackPlugin({
                template: 'web/index.html',
                filename: 'index.html',
                isWeb: true,
            }),
            __DEV__ && new ReactRefreshWebpackPlugin(),
        ],
        watch: true,
    };

    return config;
};

export default getConfiguration;
