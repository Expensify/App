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
var native_1 = require("@react-navigation/native");
var RootNavigatorExtraContent_1 = require("@components/Navigation/RootNavigatorExtraContent");
var useNavigationResetOnLayoutChange_1 = require("@libs/Navigation/AppNavigator/useNavigationResetOnLayoutChange");
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
var createPlatformStackNavigatorComponent_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent");
var defaultPlatformStackScreenOptions_1 = require("@libs/Navigation/PlatformStackNavigation/defaultPlatformStackScreenOptions");
var RootStackRouter_1 = require("./RootStackRouter");
// This is an optimization to keep mounted only last few screens in the stack.
function useCustomRootStackNavigatorState(_a) {
    var state = _a.state;
    var lastSplitIndex = state.routes.findLastIndex(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); });
    var routesToRender = state.routes.slice(Math.max(0, lastSplitIndex - 1), state.routes.length);
    return __assign(__assign({}, state), { routes: routesToRender, index: routesToRender.length - 1 });
}
var RootStackNavigatorComponent = (0, createPlatformStackNavigatorComponent_1.default)('RootStackNavigator', {
    createRouter: RootStackRouter_1.default,
    defaultScreenOptions: defaultPlatformStackScreenOptions_1.default,
    useCustomEffects: useNavigationResetOnLayoutChange_1.default,
    useCustomState: useCustomRootStackNavigatorState,
    ExtraContent: RootNavigatorExtraContent_1.default,
});
function createRootStackNavigator(config) {
    // In React Navigation 7 createNavigatorFactory returns any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (0, native_1.createNavigatorFactory)(RootStackNavigatorComponent)(config);
}
exports.default = createRootStackNavigator;
