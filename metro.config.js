/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 */

const {getDefaultConfig} = require('metro-config');
const _ = require('underscore');
require('dotenv').config();

/* eslint arrow-body-style: 0 */
module.exports = (() => {
    const isUsingMockAPI = process.env.E2E_TESTING === 'true';
    if (isUsingMockAPI) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Using mock API');
    }

    return getDefaultConfig()
        .then((config) => {
            return {
                resolver: {
                    assetExts: _.filter(config.resolver.assetExts, ext => ext !== 'svg'),
                    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'svg'],
                    resolveRequest: (context, moduleName, platform) => {
                        const resolution = context.resolveRequest(context, moduleName, platform);
                        if (isUsingMockAPI && moduleName.includes('/API')) {
                            return {
                                ...resolution,
                                filePath: resolution.filePath.replace(/src\/libs\/API.js/, 'src/libs/E2E/API.mock.js'),
                            };
                        }
                        return resolution;
                    },
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
