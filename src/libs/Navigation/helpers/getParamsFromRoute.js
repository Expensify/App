"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("@libs/Navigation/linkingConfig/config");
var ROUTES_1 = require("@src/ROUTES");
function getParamsFromRoute(screenName, includeSharedParams) {
    var _a, _b;
    var routeConfig = config_1.normalizedConfigs[screenName];
    if (!(routeConfig === null || routeConfig === void 0 ? void 0 : routeConfig.pattern)) {
        return [];
    }
    var route = routeConfig.pattern;
    var pathParams = (_a = route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g)) !== null && _a !== void 0 ? _a : [];
    if (!includeSharedParams) {
        return pathParams;
    }
    // Get shared parameters from the configuration
    var sharedParams = (_b = ROUTES_1.SHARED_ROUTE_PARAMS[screenName]) !== null && _b !== void 0 ? _b : [];
    // Combine both path parameters and shared parameters, removing duplicates
    return __spreadArray([], new Set(__spreadArray(__spreadArray([], pathParams, true), sharedParams, true)), true);
}
exports.default = getParamsFromRoute;
