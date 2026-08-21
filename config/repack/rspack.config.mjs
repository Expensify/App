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
 * Packages that must stay on the babel + hermes-parser pipeline. Two reasons:
 * - Flow-typed runtime JS, which OXC/SWC cannot parse (scan: `@flow` pragma in shipped files).
 * - `codegenNativeComponent` calls in shipped JS, which need the RN preset's babel-plugin-codegen
 *   to register Fabric view configs at build time — without it the app crashes on boot with
 *   "View config not found for component `RNSSafeAreaView`".
 * Everything else in node_modules goes through the OXC pipeline.
 */
const BABEL_PACKAGES = [
    // Flow-typed:
    'react-native',
    '@react-native',
    '@react-native-picker/picker',
    'deprecated-react-native-prop-types',
    'react-native-blob-util',
    'react-native-config',
    'react-native-fs',
    'react-native-image-size',
    'react-native-pdf',
    'shallowequal',
    // Re.Pack's own JS runtime: through the OXC chain its native-module lookup breaks on boot
    // ("repack react-native module was not found") — keep it on the stock pipeline.
    '@callstack/repack',
    // codegenNativeComponent in shipped JS (scan: grep -rl codegenNativeComponent, runtime pkgs only):
    '@expensify/react-native-live-markdown',
    '@sentry/react-native',
    '@shopify/react-native-skia',
    'lottie-react-native',
    'react-native-advanced-input-mask',
    'react-native-keyboard-controller',
    'react-native-plaid-link-sdk',
    'react-native-reanimated',
    'react-native-safe-area-context',
    'react-native-screens',
    'react-native-svg',
    'react-native-webview',
];
// Trailing slash so `react-native` doesn't swallow `react-native-*` packages (alternation falls
// through to the explicit entries for those).
const babelPackagesRegex = new RegExp(`node_modules/(${BABEL_PACKAGES.join('|')})/`);

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
                // Babel-required packages (Flow-typed + codegenNativeComponent, see BABEL_PACKAGES) stay on babel + hermes-parser:
                // OXC/SWC cannot parse Flow. React Compiler never applied here (babel sources filter).
                {
                    test: /\.[cm]?[jt]sx?$/,
                    include: [babelPackagesRegex],
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
                // All other node_modules: same OXC pipeline as app source, minus Fullstory and
                // React Compiler (neither makes sense for third-party code). This avoids the
                // babel + hermes-parser pass entirely — hermes-parser is pathological on prebuilt
                // minified bundles (e.g. @lottiefiles/dotlottie-react took ~95s to parse) and adds
                // nothing for non-Flow files. Worklet-containing libs (reanimated, live-markdown)
                // still get the worklets plugin via worklets-loader's text sniff.
                {
                    test: /\.[cm]?[jt]sx?$/,
                    exclude: [path.resolve(projectRoot, 'src'), babelPackagesRegex],
                    type: 'javascript/auto',
                    // parallel: worker-pool loaders, same as babel-swc above — without it this chain
                    // runs on one thread and dev-server cold start doubles (263s vs 130s measured).
                    use: [
                        {loader: path.resolve(__dirname, './cjs-inline-requires-loader.mjs'), parallel: true, options: {sourcemap: false, hermesLowering: true}},
                        {loader: path.resolve(__dirname, '../rsbuild/loaders/worklets-loader.mjs'), parallel: true, options: {}},
                        {
                            loader: path.resolve(__dirname, '../rsbuild/loaders/oxc-react-compiler-loader.mjs'),
                            parallel: true,
                            options: {
                                // refresh must stay off here: Repack's Fast Refresh runtime doesn't wrap
                                // node_modules, so injected $RefreshSig$ calls crash on boot ("[runtime
                                // not ready]: ReferenceError: Property '$RefreshSig$' doesn't exist").
                                jsx: {runtime: 'automatic', development: isDev, refresh: false},
                                // Prebuilt packages ship multi-source .map files that @jridgewell/remapping
                                // (here and in cjs-inline-requires-loader) cannot compose. Drop maps for
                                // node_modules at the start of the chain — babel-swc-loader does the same.
                                sourcemap: false,
                            },
                        },
                    ],
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
