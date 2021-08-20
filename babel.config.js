require('dotenv').config();

const defaultPresets = ['@babel/preset-react', '@babel/preset-env', '@babel/preset-flow'];
const defaultPlugins = [
    // Adding the commonjs: true option to react-native-web plugin can cause styling conflicts
    ['react-native-web'],

    '@babel/transform-runtime',
    '@babel/plugin-proposal-class-properties',

    // We use `transform-class-properties` for transforming ReactNative libraries and do not use it for our own
    // source code transformation as we do not use class property assignment.
    'transform-class-properties',

    // Keep it last
    'react-native-reanimated/plugin',
];

const webpack = {
    env: {
        production: {
            presets: defaultPresets,
            plugins: [...defaultPlugins, 'transform-remove-console'],
        },
        development: {
            presets: defaultPresets,
            plugins: defaultPlugins,
        },
    },
};

const metro = {
    presets: [require('metro-react-native-babel-preset')],
    plugins: [
        'react-native-reanimated/plugin',
    ],
};

/* When CAPTURE_METRICS is set we add these aliases to also capture
 * React.Profiler metrics for release builds */
if (process.env.CAPTURE_METRICS) {
    const path = require('path');
    const profilingRenderer = path.resolve(
        __dirname,
        './node_modules/react-native/Libraries/Renderer/implementations/ReactNativeRenderer-profiling',
    );

    metro.plugins.push(['module-resolver', {
        root: ['./'],
        alias: {
            'ReactNativeRenderer-prod': profilingRenderer,
            'scheduler/tracing': 'scheduler/tracing-profiling',
        },
    }]);
}

module.exports = ({caller}) => {
    // For `react-native` (iOS/Android) caller will be "metro"
    // For `webpack` (Web) caller will be "@babel-loader"
    // For `storybook` there won't be any config at all so we must give default argument of an empty object
    const runningIn = caller((args = {}) => args.name);
    return ['metro', 'babel-jest'].includes(runningIn) ? metro : webpack;
};
