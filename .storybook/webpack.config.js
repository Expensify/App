/* eslint-disable no-param-reassign */
/* eslint-disable @lwc/lwc/no-async-await */
const path = require('path');
module.exports = async ({config}) => {
    config.resolve.alias = {
        'react-native-config': 'react-web-config',
        'react-native$': 'react-native-web',
    };

    const definePluginId = config.plugins.findIndex(p => p.constructor.name === 'DefinePlugin');
    config.plugins[definePluginId].definitions.__REACT_WEB_CONFIG__ = JSON.stringify({});

    config.resolve.extensions.push('.web.js', '.website.js');
    return config;
};
