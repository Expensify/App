/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const path = require('path');
const dotenv = require('dotenv');
const _ = require('underscore');
const custom = require('../config/webpack/webpack.common')({
    envFile: '../.env.production',
});

const env = dotenv.config({path: path.resolve(__dirname, '../.env.staging')}).parsed;

module.exports = ({config}) => {
    config.resolve.alias = {
        'react-native-config': 'react-web-config',
        'react-native$': 'react-native-web',
        '@react-native-community/netinfo': path.resolve(__dirname, '../__mocks__/@react-native-community/netinfo.js'),
    };

    // Necessary to overwrite the values in the existing DefinePlugin hardcoded to the Config staging values
    const definePluginIndex = _.findIndex(config.plugins, plugin => plugin.constructor.name === 'DefinePlugin');
    config.plugins[definePluginIndex].definitions.__REACT_WEB_CONFIG__ = JSON.stringify(env);
    config.resolve.extensions.push('.web.js', '.website.js');

    const babelRulesIndex = _.findIndex(custom.module.rules, rule => rule.loader === 'babel-loader');
    const babelRule = custom.module.rules[babelRulesIndex];
    config.module.rules.push(babelRule);

    // Allows loading SVG - more context here https://github.com/storybookjs/storybook/issues/6188
    const fileLoaderRule = _.find(config.module.rules, rule => rule.test && rule.test.test('.svg'));
    fileLoaderRule.exclude = /\.svg$/;
    config.module.rules.push({
        test: /\.svg$/,
        enforce: 'pre',
        loader: require.resolve('@svgr/webpack'),
    });

    return config;
};
