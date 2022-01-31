/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */

const {getDefaultConfig} = require('metro-config');
const _ = require('underscore');

/* eslint arrow-body-style: 0 */
module.exports = (() => {
    return getDefaultConfig()
        .then((config) => {
            return {
                resolver: {
                    assetExts: _.filter(config.resolver.assetExts, ext => ext !== 'svg'),
                    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'svg'],
                },
                transformer: {
                    getTransformOptions: () => ({
                        transform: {
                            experimentalImportSupport: false,
                            inlineRequires: true,
                        },
                    }),
                    babelTransformerPath: require.resolve('react-native-svg-transformer'),
                },
            };
        });
})();
