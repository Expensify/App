const {getDefaultConfig} = require('expo/metro-config');
const {mergeConfig} = require('@react-native/metro-config');
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
require('dotenv').config();

const defaultConfig = getDefaultConfig(__dirname);

const isE2ETesting = process.env.E2E_TESTING === 'true';
const e2eSourceExts = ['e2e.js', 'e2e.ts', 'e2e.tsx'];

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: [...defaultAssetExts, 'lottie'],
        // When we run the e2e tests we want files that have the extension e2e.js to be resolved as source files
        sourceExts: [...(isE2ETesting ? e2eSourceExts : []), ...defaultSourceExts, 'jsx'],
    },
};

module.exports = mergeConfig(defaultConfig, config);
