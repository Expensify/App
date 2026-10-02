// Since Reanimated 4.6 its shared files are split into `.native`/`.web` variants and Jest resolves the `.native` ones,
// which call native-only APIs at import time (e.g. `setCSSEventHandler`) and crash every suite that imports Reanimated.
// Reanimated's resolver maps those files to their web variants (and chains the Worklets resolver), but replacing the
// jest-expo preset's React Native resolver would break mocking `react-native/*` subpaths, so this chains both.
const reactNativeResolver = require('@react-native/jest-preset/jest/resolver');
const reanimatedResolver = require('react-native-reanimated/jest/resolver');

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) =>
    reanimatedResolver(request, {
        ...options,
        defaultResolver: (path, nextOptions) => reactNativeResolver(path, {...nextOptions, defaultResolver: options.defaultResolver}),
    });
