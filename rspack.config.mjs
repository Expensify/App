import * as Repack from '@callstack/repack';
import {ExpoModulesPlugin} from '@callstack/repack-plugin-expo-modules';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 * Used for native JS bundling via Re.Pack (see rock.config.mjs).
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */
export default Repack.defineRspackConfig((env) => {
    const isDev = env.mode !== 'production';

    return {
        context: __dirname,
        entry: './index.js',
        experiments: {
            cache: {
                type: 'persistent',
            },
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
                'expo/virtual/env': path.resolve(__dirname, './config/repack/expoVirtualEnv.ts'),
            },
            tsConfig: {
                configFile: path.resolve(__dirname, './tsconfig.json'),
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
                // fullstory (needs JSX) → oxc → worklets → lazy-CJS lowering.
                {
                    test: /\.[cm]?[jt]sx?$/,
                    include: [path.resolve(__dirname, 'src')],
                    type: 'javascript/auto',
                    use: [
                        {loader: path.resolve(__dirname, './config/repack/swc-lazy-imports-loader.mjs')},
                        {loader: path.resolve(__dirname, './config/rsbuild/loaders/worklets-loader.mjs')},
                        {
                            loader: path.resolve(__dirname, './config/rsbuild/loaders/oxc-react-compiler-loader.mjs'),
                            // Same options as the web build (config/rsbuild/rsbuild.common.ts).
                            options: {
                                reactCompiler: {target: '19', panicThreshold: 'none', isDev},
                                jsx: {runtime: 'automatic', development: isDev, refresh: isDev},
                            },
                        },
                        {loader: path.resolve(__dirname, './config/rsbuild/loaders/fullstory-annotation-loader.mjs')},
                    ],
                },
                // Everything else stays on babel-swc: RN core and several libs ship Flow-typed JS,
                // which OXC cannot parse. React Compiler never applied here (babel sources filter).
                {
                    test: /\.[cm]?[jt]sx?$/,
                    exclude: [path.resolve(__dirname, 'src')],
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
        plugins: [new Repack.RepackPlugin(), new ExpoModulesPlugin(), process.env.RSDOCTOR && new RsdoctorRspackPlugin()].filter(Boolean),
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
