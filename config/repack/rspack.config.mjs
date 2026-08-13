import * as Repack from '@callstack/repack';
import {ExpoModulesPlugin} from '@callstack/repack-plugin-expo-modules';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import {SwcJsMinimizerRspackPlugin} from '@rspack/core';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// This file lives in config/repack; the project root is two levels up.
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 * This is the native (iOS/Android) bundler config, the counterpart to the web build's
 * config/rsbuild/rsbuild.config.ts. Used for native JS bundling via Re.Pack (see rock.config.mjs).
 * A thin re-export at the repo root (rspack.config.mjs) keeps Re.Pack's root-only config discovery working.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */
export default Repack.defineRspackConfig((env) => {
    const isDev = env.mode !== 'production';

    return {
        context: projectRoot,
        entry: './index.js',
        cache: {
            type: 'persistent',
            // `buildDependencies` defaults to [] and rspack cannot see files that loaders read at runtime, so
            // without this the cache silently reuses stale transform output after a babel/loader/.env change —
            buildDependencies: [
                path.resolve(projectRoot, 'babel.config.js'),
                path.resolve(projectRoot, 'config/babel/reactCompilerConfig.js'),
                path.resolve(projectRoot, 'config/repack/rspack.config.mjs'),
                path.resolve(projectRoot, 'config/repack/cjs-inline-requires-loader.mjs'),
                path.resolve(projectRoot, 'config/repack/expoVirtualEnv.ts'),
                path.resolve(projectRoot, 'config/rsbuild/loaders/fullstory-annotation-loader.mjs'),
                path.resolve(projectRoot, 'config/rsbuild/loaders/oxc-react-compiler-loader.mjs'),
                path.resolve(projectRoot, 'config/rsbuild/loaders/worklets-loader.mjs'),
                // babel.config.js bakes EXPO_PUBLIC_* values from .env into the output at transform time.
                path.resolve(projectRoot, '.env'),
                // node_modules is a `snapshot.managedPaths` entry, so dependency changes are otherwise invisible.
                path.resolve(projectRoot, 'package-lock.json'),
            ],
        },
        devServer: {
            // keep using `/.expo/.virtual-metro-entry` as entrypoint
            proxy: [
                {
                    context: ['/.expo/.virtual-metro-entry'],
                    pathRewrite: {'^/.expo/.virtual-metro-entry': '/index'},
                },
            ],
        },
        resolve: {
            ...Repack.getResolveOptions({enablePackageExports: true}),
            // expo/virtual/env relies on Expo's Metro integration to supply EXPO_PUBLIC_* values;
            // without it expo replaces global fetch with expo/fetch and API requests fail
            // ("Property 'ReadableStream' doesn't exist"). See config/repack/expoVirtualEnv.ts.
            alias: {
                'expo/virtual/env': path.resolve(__dirname, './expoVirtualEnv.ts'),
            },
            tsConfig: {
                configFile: path.resolve(projectRoot, './tsconfig.json'),
                references: 'auto',
            },
        },
        module: {
            parser: {
                javascript: {
                    dynamicImportMode: 'eager',
                },
            },
            rules: [
                // App source: the web build's OXC pipeline (config/rsbuild/loaders), so React Compiler
                // runs through the same Rust compiler on both platforms. Loaders run bottom-up:
                // fullstory (needs JSX) → oxc → worklets → CJS lowering with inlined requires.
                {
                    test: /\.[cm]?[jt]sx?$/,
                    include: [path.resolve(projectRoot, 'src')],
                    type: 'javascript/auto',
                    use: [
                        {loader: path.resolve(__dirname, './cjs-inline-requires-loader.mjs')},
                        {loader: path.resolve(__dirname, '../rsbuild/loaders/worklets-loader.mjs')},
                        {
                            loader: path.resolve(__dirname, '../rsbuild/loaders/oxc-react-compiler-loader.mjs'),
                            // Same options as the web build (config/rsbuild/rsbuild.common.ts).
                            options: {
                                reactCompiler: {target: '19', panicThreshold: 'none', isDev},
                                jsx: {runtime: 'automatic', development: isDev, refresh: isDev},
                            },
                        },
                        {loader: path.resolve(__dirname, '../rsbuild/loaders/fullstory-annotation-loader.mjs')},
                    ],
                },
                // Everything else stays on babel-swc: RN core and several libs ship Flow-typed JS,
                // which OXC cannot parse. React Compiler never applied here (babel sources filter).
                {
                    test: /\.[cm]?[jt]sx?$/,
                    exclude: [
                        path.resolve(projectRoot, 'src'),
                        // Prebuilt minified browser bundle; babelLoader's hermes-parser pass takes ~95s
                        // to parse it, serializing the whole cold build. Plain ESM with no RN-specific
                        // syntax, so rspack can parse it natively.
                        path.resolve(projectRoot, 'node_modules/@lottiefiles/dotlottie-react'),
                    ],
                    type: 'javascript/auto',
                    use: {
                        loader: '@callstack/repack/babel-swc-loader',
                        parallel: true,
                        options: {
                            // SWC's equivalent of Metro's `inlineRequires` — required to tolerate the
                            // app's import cycles (without it the app crashes on boot).
                            lazyImports: true,
                        },
                    },
                },
                ...Repack.getAssetTransformRules(),
                {
                    test: /\.lottie$/,
                    use: '@callstack/repack/assets-loader',
                },
            ],
        },
        optimization: {
            minimize: !isDev,
            minimizer: [
                new SwcJsMinimizerRspackPlugin({
                    test: /\.(js)?bundle(\?.*)?$/i,
                    extractComments: false,
                    minimizerOptions: {
                        format: {comments: false},
                    },
                }),
            ],
        },
        plugins: [new Repack.RepackPlugin(), new ExpoModulesPlugin(), new ReanimatedPlugin({unstable_disableTransform: true}), process.env.RSDOCTOR && new RsdoctorRspackPlugin()].filter(
            Boolean,
        ),
        ignoreWarnings: [
            // React Compiler bailouts on rule-violating components — silenced the same way as web.
            /oxc-react-compiler-loader:/,
            /Module not found: Can't resolve '@react-native-masked-view\/masked-view'/,
            /Module not found: Can't resolve 'react-native-worklets-core'/,
            /Module not found: Can't resolve '@shopify\/react-native-skia'/,
            /'`setUpTests` is available only in Jest environment\.'/,
        ],
    };
});
