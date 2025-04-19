
exports.__esModule = true;
exports.linkingConfig = void 0;
const customGetPathFromState_1 = require('@libs/Navigation/helpers/customGetPathFromState');
const getAdaptedStateFromPath_1 = require('@libs/Navigation/helpers/getAdaptedStateFromPath');
const config_1 = require('./config');
const prefixes_1 = require('./prefixes');

const linkingConfig = {
    getStateFromPath: getAdaptedStateFromPath_1['default'],
    getPathFromState: customGetPathFromState_1['default'],
    prefixes: prefixes_1['default'],
    config: config_1.config,
};
exports.linkingConfig = linkingConfig;
