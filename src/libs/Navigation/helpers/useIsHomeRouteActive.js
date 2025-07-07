"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var useRootNavigationState_1 = require("@hooks/useRootNavigationState");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
/**
 * Determines if the current route is the Home route/screen
 */
function useIsHomeRouteActive(isNarrowLayout) {
    var _a;
    var focusedRoute = (0, native_1.useNavigationState)(native_1.findFocusedRoute);
    var navigationState = (0, useRootNavigationState_1.default)(function (x) { return x; });
    if (isNarrowLayout) {
        return (focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) === SCREENS_1.default.HOME;
    }
    // On full width screens HOME is always a sidebar to the Reports Screen
    var isSplit = ((_a = navigationState === null || navigationState === void 0 ? void 0 : navigationState.routes.at(-1)) === null || _a === void 0 ? void 0 : _a.name) === NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR;
    var isReport = (focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) === SCREENS_1.default.REPORT;
    return isSplit && isReport;
}
exports.default = useIsHomeRouteActive;
