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
var native_1 = require("@react-navigation/native");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useNavigationResetOnLayoutChange_1 = require("@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange");
var createPlatformStackNavigatorComponent_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent");
var defaultPlatformStackScreenOptions_1 = require("@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions");
var SidebarSpacerWrapper_1 = require("./SidebarSpacerWrapper");
var SplitRouter_1 = require("./SplitRouter");
var usePreserveNavigatorState_1 = require("./usePreserveNavigatorState");
function useCustomEffects(props) {
    (0, useNavigationResetOnLayoutChange_1.default)(props);
    (0, usePreserveNavigatorState_1.default)(props.state, props.parentRoute);
}
function useCustomSplitNavigatorState(_a) {
    var state = _a.state;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var sidebarScreenRoute = state.routes.at(0);
    if (!sidebarScreenRoute) {
        return state;
    }
    var centralScreenRoutes = state.routes.slice(1);
    var routesToRender = shouldUseNarrowLayout ? state.routes.slice(-2) : __spreadArray([sidebarScreenRoute], centralScreenRoutes.slice(-2), true);
    return __assign(__assign({}, state), { routes: routesToRender, index: routesToRender.length - 1 });
}
var SplitNavigatorComponent = (0, createPlatformStackNavigatorComponent_1.default)('SplitNavigator', {
    createRouter: SplitRouter_1.default,
    useCustomEffects: useCustomEffects,
    defaultScreenOptions: defaultPlatformStackScreenOptions_1.default,
    useCustomState: useCustomSplitNavigatorState,
    NavigationContentWrapper: SidebarSpacerWrapper_1.default,
});
function createSplitNavigator(config) {
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (0, native_1.createNavigatorFactory)(SplitNavigatorComponent)(config);
}
exports.default = createSplitNavigator;
