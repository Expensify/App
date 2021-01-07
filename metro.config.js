/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {getDefaultConfig} = require('metro-config');

module.exports = (async () => {
    const {
        resolver: {assetExts},
    } = await getDefaultConfig();
    return {
        resolver: {
            assetExts: assetExts.filter(ext => ext !== 'svg'),
            sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'svg'],
        },
        transformer: {
            getTransformOptions: async () => ({
                transform: {
                    experimentalImportSupport: false,
                    inlineRequires: false,
                },
            }),
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
        },
    };
})();
