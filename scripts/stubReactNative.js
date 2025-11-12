// Comprehensive React Native module interceptor for ts-node
const Module = require('module');

const originalRequire = Module.prototype.require;

// List of modules to stub (we don't need these in scripts)
const MODULES_TO_STUB = new Set([
    'react-native',
    'react-native-config',
    'react-native-key-command',
    '@expensify/react-native-hybrid-app',
    'react-native-sound',
    'react-native-blob-util',
    'react-native-fs',
    'react-native-reanimated',
    'react-native-performance',
    'react-native-gesture-handler',
    'react-native-safe-area-context',
    'react-native-picker-select',
    'react-native-onyx',
    '@react-navigation/native',
    'expo-av',
]);

// Stub implementations
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
    '@expensify/react-native-hybrid-app': {
        isHybridApp: () => false,
        getHybridAppSettings: () => Promise.resolve(null),
    },
};

// Override require to intercept React Native modules
Module.prototype.require = function (...args) {
    const id = args[0];

    // Check if this is a module we want to stub
    if (MODULES_TO_STUB.has(id) || id.startsWith('react-native')) {
        const stub = STUBS[id] || {};
        return {__esModule: true, default: stub, ...stub};
    }

    // For other modules, use original require
    return originalRequire.apply(this, args);
};
