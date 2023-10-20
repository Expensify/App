const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
const _ = require('underscore');
require('dotenv').config();

const defaultConfig = getDefaultConfig(__dirname);

const isUsingMockAPI = process.env.E2E_TESTING === 'true';
// eslint-disable-next-line no-console
console.log(typeof process.env.E2E_TESTING);
// eslint-disable-next-line no-console
console.log(process.env.E2E_TESTING);
if (isUsingMockAPI) {
    // eslint-disable-next-line no-console
    console.log('⚠️ Using mock API');
}

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: _.filter(defaultAssetExts, (ext) => ext !== 'svg'),
        sourceExts: [...defaultSourceExts, 'jsx', 'svg'],
        resolveRequest: (context, moduleName, platform) => {
            const resolution = context.resolveRequest(context, moduleName, platform);
            // eslint-disable-next-line no-console
            console.log(`🟠 resolving module name ${moduleName} original path: ${resolution.filePath}`);
            if (isUsingMockAPI && moduleName.includes('/API')) {
                const originalPath = resolution.filePath;
                const mockPath = originalPath.replace('src/libs/API.ts', 'src/libs/E2E/API.mock.js').replace('/src/libs/API.js/', 'src/libs/E2E/API.mock.js');
                // eslint-disable-next-line no-console
                console.log('🔴 Replace', originalPath, ' => ', mockPath);

                return {
                    ...resolution,
                    filePath: mockPath,
                };
            }
            return resolution;
        },
    },
    transformer: {
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
};

module.exports = mergeConfig(defaultConfig, config);
