const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
const _ = require('underscore');
require('dotenv').config();

const defaultConfig = getDefaultConfig(__dirname);

const isE2ETesting = process.env.E2E_TESTING === 'true';

if (isE2ETesting) {
    // eslint-disable-next-line no-console
    console.log('⚠️⚠️⚠️⚠️ Using mock API ⚠️⚠️⚠️⚠️');
}

const e2eSourceExts = ['e2e.js', 'e2e.ts'];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: [..._.filter(defaultAssetExts, (ext) => ext !== 'svg'), 'lottie'],
        // When we run the e2e tests we want files that have the extension e2e.js to be resolved as source files
        sourceExts: [...(isE2ETesting ? e2eSourceExts : []), ...defaultSourceExts, 'jsx', 'svg'],
        resolveRequest: (context, moduleName, platform) => {
            const resolution = context.resolveRequest(context, moduleName, platform);
            if (isE2ETesting && moduleName.includes('/API')) {
                const originalPath = resolution.filePath;
                const mockPath = originalPath.replace('src/libs/API.ts', 'src/libs/E2E/API.mock.ts').replace('/src/libs/API.ts/', 'src/libs/E2E/API.mock.ts');
                // eslint-disable-next-line no-console
                console.log('⚠️⚠️⚠️⚠️ Replacing resolution path', originalPath, ' => ', mockPath);

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
