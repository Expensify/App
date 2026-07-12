require('dotenv').config();
/**
 * Expo SDK 56 replaces global fetch with expo/fetch unless this is set at transform time.
 * metro.config.js sets it for the Metro process; babel needs it here so release bundles inline the value.
 */
process.env.EXPO_PUBLIC_USE_RN_FETCH = process.env.EXPO_PUBLIC_USE_RN_FETCH ?? '1';

const BaseReactCompilerConfig = require('./config/babel/reactCompilerConfig');
const {expoInlineEnvVars} = require('babel-preset-expo/build/plugins/inline-env-vars');

const ReactCompilerConfig = {
    ...BaseReactCompilerConfig,
    sources: (filename) => !filename.includes('tests/') && !filename.includes('node_modules/'),
};

/**
 * Custom plugin that prints a file name when it's being processed by babel.
 * Disabled by default. To enable, set DEBUG_BABEL_TRACE=true in the environment.
 */
function traceTransformer() {
    return {
        visitor: {
            Program(path, state) {
                console.log('🔧 Transforming file:', state.filename);
            },
        },
    };
}

const metro = {
    presets: [require('@react-native/babel-preset')],
    plugins: [
        ['babel-plugin-react-compiler', ReactCompilerConfig], // must run first!

        // This is needed due to a react-native bug: https://github.com/facebook/react-native/issues/29084#issuecomment-1030732709
        // It is included in metro-react-native-babel-preset but needs to be before plugin-proposal-class-properties or FlatList will break
        '@babel/plugin-transform-flow-strip-types',

        // Inline EXPO_PUBLIC_* env vars into release bundles (e.g. EXPO_PUBLIC_USE_RN_FETCH to keep RN fetch).
        expoInlineEnvVars,

        ['@babel/plugin-proposal-class-properties', {loose: true}],
        ['@babel/plugin-proposal-private-methods', {loose: true}],
        ['@babel/plugin-proposal-private-property-in-object', {loose: true}],

        /* Fullstory */
        '@fullstory/react-native',
        [
            '@fullstory/babel-plugin-annotate-react',
            {
                native: true,
            },
        ],

        // Import alias for native devices
        [
            'module-resolver',
            {
                extensions: [
                    '.native.js',
                    '.native.jsx',
                    '.native.ts',
                    '.native.tsx',
                    '.js',
                    '.jsx',
                    '.ts',
                    '.tsx',
                    '.ios.js',
                    '.ios.jsx',
                    '.ios.ts',
                    '.ios.tsx',
                    '.android.js',
                    '.android.jsx',
                    '.android.ts',
                    '.android.tx',
                ],
                alias: {
                    '@assets': './assets',
                    '@components': './src/components',
                    '@hooks': './src/hooks',
                    '@libs': './src/libs',
                    '@navigation': './src/libs/Navigation',
                    '@pages': './src/pages',
                    '@prompts': './prompts',
                    '@styles': './src/styles',
                    // This path is provide alias for files like `ONYXKEYS` and `CONST`.
                    '@src': './src',
                    '@userActions': './src/libs/actions',
                    '@github': './.github',
                    '@selectors': './src/selectors',
                },
            },
        ],
        '@babel/plugin-transform-export-namespace-from',
        // The worklets babel plugin needs to be last, as stated here: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
        'react-native-worklets/plugin',
    ],
    env: {
        production: {
            plugins: [['transform-remove-console', {exclude: ['error', 'warn']}]],
        },
        test: {
            plugins: ['@babel/plugin-transform-dynamic-import'],
        },
    },
};

if (process.env.DEBUG_BABEL_TRACE) {
    metro.plugins.push(traceTransformer);
}

/*
 * We use <React.Profiler> and react-native-performance to capture/monitor stats
 * By default <React.Profiler> is disabled in production as it adds small overhead
 * When CAPTURE_METRICS is set we're explicitly saying that we want to capture metrics
 * To enable the <Profiler> for release builds we add these aliases */
if (process.env.CAPTURE_METRICS === 'true') {
    const path = require('path');
    const profilingRenderer = path.resolve(__dirname, './node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-profiling');

    metro.plugins.push([
        'module-resolver',
        {
            root: ['./'],
            alias: {
                'ReactNativeRenderer-prod': profilingRenderer,
                'scheduler/tracing': 'scheduler/tracing-profiling',
            },
        },
        'extra-alias',
    ]);
}

module.exports = (api) => {
    if (!process.env.KNIP) {
        console.debug('babel.config.js');
        console.debug('  - api.version:', api.version);
        console.debug('  - api.env:', api.env());
        console.debug('  - process.env.NODE_ENV:', process.env.NODE_ENV);
        console.debug('  - process.env.BABEL_ENV:', process.env.BABEL_ENV);
    }

    // For `react-native` (iOS/Android) caller will be "metro"
    // For jest, it will be babel-jest
    // The web build and Storybook (Rsbuild) don't call into this file at all — their JS/TS/JSX
    // pipeline goes through OXC directly (see config/rsbuild/rsbuild.common.ts), bypassing Babel.
    const runningIn = api.caller((args = {}) => args.name);
    if (!process.env.KNIP) {
        console.debug('  - running in: ', runningIn);
    }

    return ['metro', 'babel-jest'].includes(runningIn) ? metro : {};
};
