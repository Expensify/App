import * as Repack from '@callstack/repack';
import {ExpoModulesPlugin} from '@callstack/repack-plugin-expo-modules';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
import {RsdoctorRspackPlugin} from '@rsdoctor/rspack-plugin';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
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
        // equivalent to babel-plugin-odule-resolver
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
                    options: {},
                },
            },
            ...Repack.getAssetTransformRules(),
            {
                test: /\.lottie$/,
                use: '@callstack/repack/assets-loader',
            },
        ],
    },
    plugins: [new Repack.RepackPlugin(), new ExpoModulesPlugin(), new ReanimatedPlugin({unstable_disableTransform: true}), process.env.RSDOCTOR && new RsdoctorRspackPlugin()].filter(
        Boolean,
    ),
    ignoreWarnings: [
        /Module not found: Can't resolve '@react-native-masked-view\/masked-view'/,
        /Module not found: Can't resolve 'react-native-worklets-core'/,
        /Module not found: Can't resolve '@shopify\/react-native-skia'/,
        /Module not found: Can't resolve 'react-native-reanimated\/src\/reanimated2\/core'/,
        /'`setUpTests` is available only in Jest environment\.'/,
    ],
});
