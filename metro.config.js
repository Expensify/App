const {getDefaultConfig: getExpoDefaultConfig} = require('expo/metro-config');
const {getDefaultConfig: getReactNativeDefaultConfig} = require('@react-native/metro-config');

const {mergeConfig} = require('@react-native/metro-config');
const {wrapWithReanimatedMetroConfig} = require('react-native-reanimated/metro-config');
const {withSentryConfig} = require('@sentry/react-native/metro');
const {createSentryMetroSerializer} = require('@sentry/react-native/dist/js/tools/sentryMetroSerializer');

const path = require('path');

// Prefer explicit ENVFILE (Fastlane/GHA set this), else fall back to local .env
const envPath = process.env.ENVFILE ? (path.isAbsolute(process.env.ENVFILE) ? process.env.ENVFILE : path.join(__dirname, process.env.ENVFILE)) : path.join(__dirname, '.env');
require('dotenv').config({path: envPath});

const defaultConfig = getReactNativeDefaultConfig(__dirname);
const expoConfig = getExpoDefaultConfig(__dirname);

const isE2ETesting = process.env.E2E_TESTING === 'true';
const e2eSourceExts = ['e2e.js', 'e2e.ts', 'e2e.tsx'];

const isDev = process.env.ENVIRONMENT === undefined || process.env.ENVIRONMENT === 'development';

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
    resolver: {
        assetExts: [...defaultConfig.resolver.assetExts, 'lottie'],
        // When we run the e2e tests we want files that have the extension e2e.js to be resolved as source files
        sourceExts: [...(isE2ETesting ? e2eSourceExts : []), ...defaultConfig.resolver.sourceExts, ...defaultConfig.watcher.additionalExts, 'jsx'],
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
    serializer: !isDev
        ? {
              customSerializer: createSentryMetroSerializer(),
          }
        : {},
};

const mergedConfig = wrapWithReanimatedMetroConfig(mergeConfig(defaultConfig, expoConfig, config));

module.exports = isDev ? mergedConfig : withSentryConfig(mergedConfig);
