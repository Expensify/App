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
    ignoreWarnings: [
        /Module not found: Can't resolve '@react-native-masked-view\/masked-view'/,
        /Module not found: Can't resolve 'react-native-worklets-core'/,
        /Module not found: Can't resolve '@shopify\/react-native-skia'/,
        /Module not found: Can't resolve 'react-native-reanimated\/src\/reanimated2\/core'/,
    ],
    plugins: [new Repack.RepackPlugin(), new ReanimatedPlugin(), new ExpoModulesPlugin()],
});
