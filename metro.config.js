/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {getDefaultConfig} = require('metro-config');

module.exports = (() => getDefaultConfig().then(config => ({
    resolver: {
        assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
        sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'svg'],
    },
    transformer: {
        getTransformOptions: () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: false,
            },
        }),
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
})))();
