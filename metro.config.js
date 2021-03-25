/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */

const {getDefaultConfig} = require('metro-config');

/* eslint arrow-body-style: 0 */
module.exports = (() => {
    return getDefaultConfig()
        .then((config) => {
            return {
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
            };
        });
})();
