// Comprehensive React Native module interceptor for Bun script preload.
//
// Bun's module loader resolves native ES `import` statements independently of Node's
// `Module.prototype.require`, so a require-hook alone only intercepts CJS `require()` calls, not
// `import`. `Bun.plugin`'s `module()` API registers a virtual module for an exact specifier that is
// intercepted for both `import` and `require()`, so scripts never load the real (Flow-typed) React
// Native packages they don't need at runtime.
//
// Uses the ambient `Bun` global instead of `import {plugin} from 'bun'` — importing the `"bun"` module
// resolves @types/bun's global augmentations (it redeclares `require`), which conflicts with the
// generic `require<T>` overload `src/types/global.d.ts` registers for the rest of the root TS program.
const {plugin} = globalThis.Bun;
const fs = require('node:fs');
const path = require('node:path');

const STUBS = {
    'react-native': {
        Platform: {OS: 'web', isPad: false, isTV: false, isTesting: false, Version: '0.0.0'},
        NativeModules: {},
        Dimensions: {get: () => ({width: 1024, height: 768})},
        AppState: {currentState: 'active'},
        Linking: {},
        DeviceEventEmitter: {emit: () => {}, addListener: () => ({})},
        PixelRatio: {get: () => 1, getFontScale: () => 1},
    },
    'react-native-config': {},
    'react-native-key-command': {
        constants: {
            keyModifierControl: 'keyModifierControl',
            keyModifierCommand: 'keyModifierCommand',
            keyModifierShift: 'keyModifierShift',
            keyModifierShiftControl: 'keyModifierShiftControl',
            keyModifierShiftCommand: 'keyModifierShiftCommand',
            keyInputEscape: 'keyInputEscape',
            keyInputEnter: 'keyInputEnter',
            keyInputUpArrow: 'keyInputUpArrow',
            keyInputDownArrow: 'keyInputDownArrow',
            keyInputLeftArrow: 'keyInputLeftArrow',
            keyInputRightArrow: 'keyInputRightArrow',
        },
        addEventListener: () => ({}),
        removeEventListener: () => {},
    },
    'react-native-blob-util': {},
    'react-native-fs': {},
    'react-native-reanimated': {},
    'react-native-performance': {},
    'react-native-gesture-handler': {},
    'react-native-safe-area-context': {},
    'react-native-picker-select': {},
    'react-native-onyx': {},
    '@expensify/react-native-hybrid-app': {
        isHybridApp: () => false,
        getHybridAppSettings: () => Promise.resolve(null),
    },
    '@react-navigation/native': {},
    'expo-audio': {},
};

// Bun's `module()` hook only matches an exact specifier (unlike `onResolve`'s regex `filter`, which is
// bundler-only and never fires for bare-specifier imports at runtime — verified against Bun v1.3.14).
// To catch every unscoped `react-native-*` package, not just the ones with a detailed stub above, list
// the ones actually installed and fall back to an empty stub for any that aren't already in STUBS. This
// preserves the blanket `id.startsWith('react-native')` coverage the old ts-node require-hook had, so a
// new transitive RN dependency added later can't crash a script with a Flow-syntax parse error.
const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
for (const entry of fs.readdirSync(nodeModulesDir)) {
    if (entry.startsWith('react-native') && !(entry in STUBS)) {
        STUBS[entry] = {};
    }
}

plugin({
    name: 'stub-react-native',
    setup(build) {
        for (const [specifier, stub] of Object.entries(STUBS)) {
            build.module(specifier, () => ({exports: {...stub, default: stub}, loader: 'object'}));
        }
    },
});
