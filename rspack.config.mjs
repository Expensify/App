import * as Repack from '@callstack/repack';
import {ExpoModulesPlugin} from '@callstack/repack-plugin-expo-modules';
import {ReanimatedPlugin} from '@callstack/repack-plugin-reanimated';
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

export default (env) => ({
    context: __dirname,
    entry: './index.js',
    cache: true,
    experiments: {
        cache: {
            type: 'persistent',
        },
    },
    resolve: {
        ...Repack.getResolveOptions(env.platform),
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
            ...Repack.getJsTransformRules({swc: {lazyImports: true}}),
            ...Repack.getAssetTransformRules(),
            {
                test: /\.lottie$/,
                use: '@callstack/repack/assets-loader',
            },
        ],
    },
    ignoreWarnings: [/^@react-native-masked-view/, /^react-native-worklets-core$/, /^@shopify\/react-native-skia$/, /^react-native-reanimated\/src\/reanimated2\/core$/],
    plugins: [new Repack.RepackPlugin(), new ReanimatedPlugin(), new ExpoModulesPlugin()],
});
