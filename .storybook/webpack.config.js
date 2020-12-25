const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = async ({ config }) => {
    console.log(console.log(path.resolve(__dirname, '../assets')));
    config.resolve.alias = {
        'react-native$': 'react-native-web',
    };

    config.plugins.push(
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, '../assets'),
                to: 'assets'
            }]
        }),
    );

    return config;
};
