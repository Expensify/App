/**
 * Mock for expo/src/winter that avoids lazy global polyfill installation.
 *
 * Expo's runtime.native.ts installs lazy getters on the global object for
 * TextDecoder, TextDecoderStream, URL, etc. These lazy getters defer require()
 * calls until the property is first accessed. In Jest 30, this delayed require()
 * triggers the stricter module scope guard, causing all test suites to fail with:
 *   "ReferenceError: You are trying to `import` a file outside of the scope of the test code."
 *
 * Since the jsdom test environment already provides TextDecoder, URL, URLSearchParams,
 * and other web APIs, we skip the expo polyfill installation entirely.
 */
export {};
