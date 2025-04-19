'use strict';
exports.__esModule = true;
var config_1 = require('@libs/Navigation/linkingConfig/config');
function getParamsFromRoute(screenName) {
    var _a;
    var routeConfig = config_1.normalizedConfigs[screenName];
    var route = routeConfig.pattern;
    return (_a = route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g)) !== null && _a !== void 0 ? _a : [];
}
exports['default'] = getParamsFromRoute;
