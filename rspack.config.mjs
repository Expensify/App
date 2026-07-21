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
export default Repack.defineRspackConfig({
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
        // ("Property 'ReadableStream' doesn't exist"). See config/repack/expoVirtualEnv.js.
        alias: {
            'expo/virtual/env': path.resolve(__dirname, './config/repack/expoVirtualEnv.js'),
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
            {
                test: /\.[cm]?[jt]sx?$/,
                type: 'javascript/auto',
                use: {
                    loader: '@callstack/repack/babel-swc-loader',
                    parallel: true,
                    options: {
                        // Defer module evaluation to first use (SWC's equivalent of Metro's
                        // `inlineRequires`), which this app relies on to tolerate import cycles —
                        // e.g. API/index.ts calls Request.addMiddleware at module scope within a cycle.
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
        /Module not found: Can't resolve '@react-native-masked-view\/masked-view'/,
        /Module not found: Can't resolve 'react-native-worklets-core'/,
        /Module not found: Can't resolve '@shopify\/react-native-skia'/,
        /'`setUpTests` is available only in Jest environment\.'/,
    ],
});
