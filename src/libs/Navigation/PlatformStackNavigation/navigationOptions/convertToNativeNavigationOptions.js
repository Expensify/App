"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@libs/Navigation/PlatformStackNavigation/types");
var buildPlatformSpecificNavigationOptions_1 = require("./buildPlatformSpecificNavigationOptions");
function convertToNativeNavigationOptions(screenOptions) {
    if (!screenOptions) {
        return undefined;
    }
    if ((0, types_1.isRouteBasedScreenOptions)(screenOptions)) {
        return function (props) {
            var routeBasedScreenOptions = screenOptions(props);
            return __assign(__assign({}, (0, buildPlatformSpecificNavigationOptions_1.default)(routeBasedScreenOptions)), routeBasedScreenOptions.native);
        };
    }
    return __assign(__assign({}, (0, buildPlatformSpecificNavigationOptions_1.default)(screenOptions)), screenOptions.native);
}
exports.default = convertToNativeNavigationOptions;
