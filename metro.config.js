const {getDefaultConfig: getExpoDefaultConfig} = require('expo/metro-config');
const {getDefaultConfig: getReactNativeDefaultConfig} = require('@react-native/metro-config');

const {mergeConfig} = require('@react-native/metro-config');
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
const {wrapWithReanimatedMetroConfig} = require('react-native-reanimated/metro-config');
require('dotenv').config();

const defaultConfig = getReactNativeDefaultConfig(__dirname);
const expoConfig = getExpoDefaultConfig(__dirname);

const isE2ETesting = process.env.E2E_TESTING === 'true';
const e2eSourceExts = ['e2e.js', 'e2e.ts', 'e2e.tsx'];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: [...defaultAssetExts, 'lottie'],
        // When we run the e2e tests we want files that have the extension e2e.js to be resolved as source files
        sourceExts: [...(isE2ETesting ? e2eSourceExts : []), ...defaultSourceExts, 'jsx'],
    },
    // We are merging the default config from Expo and React Native and expo one is overriding the React Native one so inlineRequires is set to false so we want to set it to true
    // for fix cycling dependencies and improve performance of app startup
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                inlineRequires: true,
            },
        }),
    },
};

module.exports = wrapWithReanimatedMetroConfig(mergeConfig(defaultConfig, expoConfig, config));
