/**
 * Packages that must stay on babel + hermes-parser in the native (Re.Pack) build: Flow-typed
 * runtime JS (OXC/SWC can't parse Flow) and packages calling `codegenNativeComponent` in shipped
 * JS, which needs the RN preset's codegen plugin to register Fabric view configs. Without it the
 * app crashes on boot.
 *
 * A scope entry (e.g. '@react-native') covers every package in that scope.
 *
 * Guarded by `scripts/checkRepackBabelAllowlist.ts` in CI: it scans node_modules for packages that
 * need the babel path and fails when one is missing here, so a dependency bump surfaces in the PR
 * instead of at app launch.
 */
const BABEL_PACKAGES = [
    // Flow-typed:
    'react-native',
    '@react-native',
    '@react-native-picker/picker',
    'deprecated-react-native-prop-types',
    'react-native-blob-util',
    'react-native-config',
    'react-native-fs',
    'react-native-image-size',
    'react-native-pdf',
    'shallowequal',
    // Re.Pack's own runtime: its native-module lookup breaks on boot through the OXC chain.
    '@callstack/repack',
    // codegenNativeComponent in shipped JS:
    '@expensify/react-native-live-markdown',
    // codegenNativeCommands in shipped JS (caught by the CI guard, not by a boot failure).
    '@fullstory/react-native',
    '@sentry/react-native',
    '@shopify/react-native-skia',
    'lottie-react-native',
    'react-native-advanced-input-mask',
    'react-native-keyboard-controller',
    'react-native-plaid-link-sdk',
    'react-native-reanimated',
    'react-native-safe-area-context',
    'react-native-screens',
    'react-native-svg',
    'react-native-webview',
];

export default BABEL_PACKAGES;
