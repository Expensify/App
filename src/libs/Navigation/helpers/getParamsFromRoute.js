
exports.__esModule = true;
const config_1 = require('@libs/Navigation/linkingConfig/config');

function getParamsFromRoute(screenName) {
    let _a;
    const routeConfig = config_1.normalizedConfigs[screenName];
    const route = routeConfig.pattern;
    return (_a = route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g)) !== null && _a !== void 0 ? _a : [];
}
exports['default'] = getParamsFromRoute;
