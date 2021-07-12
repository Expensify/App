const defaultPresets = ['@babel/preset-react', '@babel/preset-env', '@babel/preset-flow'];
const defaultPlugins = [
    // Adding the commonjs: true option to react-native-web plugin can cause styling conflicts
    ['react-native-web'],

    '@babel/transform-runtime',
    '@babel/plugin-proposal-class-properties',

    // We use `transform-class-properties` for transforming ReactNative libraries and do not use it for our own
    // source code transformation as we do not use class property assignment.
    'transform-class-properties',
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

module.exports = ({caller}) => {
    // For `react-native` (iOS/Android) caller will be "metro"
    // For `webpack` (Web) caller will be "@babel-loader"
    // For `storybook` there won't be any config at all so we must give default argument of an empty object
    const runningIn = caller((args = {}) => args.name);
    return ['metro', 'babel-jest'].includes(runningIn) ? metro : webpack;
};
