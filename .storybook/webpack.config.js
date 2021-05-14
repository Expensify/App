/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const path = require('path');
const dotenv = require('dotenv');

const env = dotenv.config({path: path.resolve(__dirname, '../.env.staging')}).parsed;

module.exports = ({config}) => {
    config.resolve.alias = {
        'react-native-config': 'react-web-config',
        'react-native$': 'react-native-web',
    };

    // Necessary to overwrite the values in the existing DefinePlugin hardcoded to the Config staging values
    const definePluginId = config.plugins.findIndex(p => p.constructor.name === 'DefinePlugin');
    config.plugins[definePluginId].definitions.__REACT_WEB_CONFIG__ = JSON.stringify(env);
    config.resolve.extensions.push('.web.js', '.website.js');
    return config;
};
