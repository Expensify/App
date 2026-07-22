/**
 * Replacement for `expo/virtual/env` when bundling natively with Re.Pack (see rspack.config.mjs).
 *
 * Expo's own module is `export const env = process.env` and relies on Expo's Metro integration to
 * populate EXPO_PUBLIC_* values at runtime — which doesn't exist under Re.Pack, leaving them
 * undefined. Most importantly, `expo/src/winter/runtime.native` checks EXPO_PUBLIC_USE_RN_FETCH
 * and, when falsy, replaces global fetch with expo/fetch — which needs ReadableStream (absent in
 * Hermes) and breaks every API request. Keep React Native's built-in fetch, same as Metro builds
 * (see metro.config.js / babel.config.js).
 */
const env: Record<string, string> = {
    EXPO_PUBLIC_USE_RN_FETCH: '1',
};

// Must be a named export: expo's compiled code imports it as `import {env} from 'expo/virtual/env'`.
// eslint-disable-next-line import/prefer-default-export
export {env};
