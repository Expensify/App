import * as Repack from '@callstack/repack';
import {ExpoModulesPlugin} from '@callstack/repack-plugin-expo-modules';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
import rspack from '@rspack/core';
import {createRequire} from 'node:module';
import path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';

const dirname = Repack.getDirname(import.meta.url);
const {resolve} = createRequire(import.meta.url);

/**
 * More documentation, installation, usage, motivation and differences with Metro is available at:
 * https://github.com/callstack/repack/blob/main/README.md
 *
 * The API documentation for the functions and plugins used in this file is available at:
 * https://re-pack.dev
 */

/**
 * Webpack configuration.
 * You can also export a static object or a function returning a Promise.
 *
 * @param env Environment options passed from either Webpack CLI or React Native Community CLI
 *            when running with `react-native start/bundle`.
 */
export default (env) => {
    const {
        mode = 'development',
        context = dirname,
        entry = './index.js',
        platform = process.env.PLATFORM,
        minimize = mode === 'production',
        devServer = undefined,
        bundleFilename = undefined,
        sourceMapFilename = undefined,
        assetsPath = undefined,
        reactNativePath = resolve('react-native'),
    } = env;

    if (!platform) {
        throw new Error('Missing platform');
    }

    return {
        mode,
        /**
         * This should be always `false`, since the Source Map configuration is done
         * by `SourceMapDevToolPlugin`.
         */
        devtool: false,
        context,
        entry,
        resolve: {
            ...Repack.getResolveOptions(platform),
            tsConfig: {
                configFile: path.resolve(dirname, './tsconfig.json'),
                references: 'auto',
            },
        },
        /**
         * Configures output.
         * It's recommended to leave it as it is unless you know what you're doing.
         * By default Webpack will emit files into the directory specified under `path`. In order for the
         * React Native app use them when bundling the `.ipa`/`.apk`, they need to be copied over with
         * `Repack.OutputPlugin`, which is configured by default inside `Repack.RepackPlugin`.
         */
        output: {
            clean: true,
            hashFunction: 'xxhash64',
            path: path.join(dirname, 'build/generated', platform),
            filename: 'index.bundle',
            chunkFilename: '[name].chunk.bundle',
            publicPath: Repack.getPublicPath({platform, devServer}),
        },
        /** Configures optimization of the built bundle. */
        optimization: {
            /** Enables minification based on values passed from React Native Community CLI or from fallback. */
            minimize,
            minimizer: [
                new TerserPlugin({
                    test: /\.(js)?bundle(\?.*)?$/i,
                    extractComments: false,
                    terserOptions: {
                        format: {
                            comments: false,
                        },
                    },
                }),
            ],
            /** Configure minimizer to process the bundle. */
            chunkIds: 'named',
        },
        module: {
            rules: [
                Repack.REACT_NATIVE_LOADING_RULES,
                Repack.NODE_MODULES_LOADING_RULES,
                Repack.FLOW_TYPED_MODULES_LOADING_RULES,
                {
                    test: /\.jsx?$/,
                    include: Repack.getModulePaths(['react-native-view-shot']),
                    use: {
                        loader: '@callstack/repack/flow-loader',
                        options: {
                            all: true,
                        },
                    },
                },
                /** Here you can adjust loader that will process your files. */
                {
                    test: /\.[jt]sx?$/,
                    exclude: [/node_modules/],
                    type: 'javascript/auto',
                    use: {
                        loader: 'builtin:swc-loader',
                        /** @type {import('@rspack/core').SwcLoaderOptions} */
                        options: {
                            env: {
                                targets: {
                                    'react-native': '0.74',
                                },
                            },
                            jsc: {
                                assumptions: {
                                    setPublicClassFields: true,
                                    privateFieldsAsProperties: true,
                                },
                                externalHelpers: true,
                                transform: {
                                    react: {
                                        runtime: 'automatic',
                                        development: mode === 'development',
                                        refresh: mode === 'development' && Boolean(devServer),
                                    },
                                },
                            },
                        },
                    },
                },
                /**
                 * This loader handles all static assets (images, video, audio and others), so that you can
                 * use (reference) them inside your application.
                 *
                 * If you want to handle specific asset type manually, filter out the extension
                 * from `ASSET_EXTENSIONS`, for example:
                 * ```
                 * Repack.ASSET_EXTENSIONS.filter((ext) => ext !== 'svg')
                 * ```
                 */
                {
                    test: Repack.getAssetExtensionsRegExp(['lottie', ...Repack.ASSET_EXTENSIONS]),
                    use: {
                        loader: '@callstack/repack/assets-loader',
                        options: {
                            platform,
                            devServerEnabled: Boolean(devServer),
                        },
                    },
                },
            ],
        },
        plugins: [
            /**
             * Configure other required and additional plugins to make the bundle
             * work in React Native and provide good development experience with
             * sensible defaults.
             *
             * `Repack.RepackPlugin` provides some degree of customization, but if you
             * need more control, you can replace `Repack.RepackPlugin` with plugins
             * from `Repack.plugins`.
             */
            new Repack.RepackPlugin({
                context,
                mode,
                platform,
                devServer,
                output: {
                    bundleFilename,
                    sourceMapFilename,
                    assetsPath,
                },
            }),
            new ReanimatedPlugin(),
            new ExpoModulesPlugin({platform}),
            // optional dep warning
            new rspack.IgnorePlugin({
                resourceRegExp: /^@react-native-masked-view/,
            }),
            // optional dep warning
            new rspack.IgnorePlugin({
                resourceRegExp: /^react-native-worklets-core$/,
            }),
            // optional dep warning
            new rspack.IgnorePlugin({
                resourceRegExp: /^@shopify\/react-native-skia$/,
            }),
            // optional dep warning from keyboard-controller
            new rspack.IgnorePlugin({
                resourceRegExp: /^react-native-reanimated\/src\/reanimated2\/core$/,
            }),
        ],
    };
};
