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
var SearchSidebar_1 = require("@components/Navigation/SearchSidebar");
var usePreserveNavigatorState_1 = require("@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState");
var useNavigationResetOnLayoutChange_1 = require("@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange");
var createPlatformStackNavigatorComponent_1 = require("@navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent");
var defaultPlatformStackScreenOptions_1 = require("@navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions");
var SearchFullscreenRouter_1 = require("./SearchFullscreenRouter");
function useCustomEffects(props) {
    (0, useNavigationResetOnLayoutChange_1.default)(props);
    (0, usePreserveNavigatorState_1.default)(props.state, props.parentRoute);
}
// This is a custom state hook that is used to render the last two routes in the stack.
// We do this to improve the performance of the search results screen.
function useCustomState(_a) {
    var state = _a.state;
    var routesToRender = __spreadArray([], state.routes.slice(-2), true);
    return __assign(__assign({}, state), { routes: routesToRender, index: routesToRender.length - 1 });
}
var SearchFullscreenNavigatorComponent = (0, createPlatformStackNavigatorComponent_1.default)('SearchFullscreenNavigator', {
    createRouter: SearchFullscreenRouter_1.default,
    defaultScreenOptions: defaultPlatformStackScreenOptions_1.default,
    useCustomEffects: useCustomEffects,
    useCustomState: useCustomState,
    ExtraContent: SearchSidebar_1.default,
});
function createSearchFullscreenNavigator(config) {
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (0, native_1.createNavigatorFactory)(SearchFullscreenNavigatorComponent)(config);
}
exports.default = createSearchFullscreenNavigator;
