"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var useRootNavigationState_1 = require("@hooks/useRootNavigationState");
var RELATIONS_1 = require("@libs/Navigation/linkingConfig/RELATIONS");
function useIsSidebarRouteActive(splitNavigatorName, isNarrowLayout) {
    var currentSplitNavigatorRoute = (0, useRootNavigationState_1.default)(function (rootState) { return rootState === null || rootState === void 0 ? void 0 : rootState.routes.at(-1); });
    if ((currentSplitNavigatorRoute === null || currentSplitNavigatorRoute === void 0 ? void 0 : currentSplitNavigatorRoute.name) !== splitNavigatorName) {
        return false;
    }
    var focusedRoute = (0, native_1.findFocusedRoute)(currentSplitNavigatorRoute === null || currentSplitNavigatorRoute === void 0 ? void 0 : currentSplitNavigatorRoute.state);
    var isSidebarRoute = (focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) === RELATIONS_1.SPLIT_TO_SIDEBAR[splitNavigatorName];
    // To check if the sidebar is active on a narrow layout, we need to check if the focused route is the sidebar route
    if (isNarrowLayout) {
        return isSidebarRoute;
    }
    // On a wide layout, the sidebar is always focused when the split navigator is opened
    return true;
}
exports.default = useIsSidebarRouteActive;
