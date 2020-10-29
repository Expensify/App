const defaultPresets = ['@babel/preset-react', '@babel/preset-env'];
const defaultPlugins = [['react-native-web', {commonjs: true}], '@babel/transform-runtime',
    // We use `transform-class-properties` for transforming ReactNative libraries and do not use it for our own
    // source code transformation as we do not use class property assignment.
    'transform-class-properties'];

const webpack = {
    env: {
        production: {
            presets: defaultPresets,
            plugins: [...defaultPlugins, 'transform-remove-console'],
        },
        development: {
            presets: defaultPresets,
            plugins: defaultPlugins,
        }
    }
};

const metro = {
    presets: [require('metro-react-native-babel-preset')],
    plugins: [],
};

module.exports = ({caller}) => {
    // For `react-native` (iOS/Android) caller will be "metro"
    // For `webpack` (Web) caller will be "@babel-loader"
    const runningIn = caller(({name}) => name);
    return runningIn === 'metro' ? metro : webpack;
};
