const custom = require('../config/webpack/webpack.common');

module.exports = {
    webpackFinal: (config) => {
        return {...config, module: {...config.module, rules: custom.module.rules}};
    },
};
