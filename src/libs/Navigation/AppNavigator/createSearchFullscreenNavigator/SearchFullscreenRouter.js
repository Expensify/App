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
var usePreserveNavigatorState_1 = require("@navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState");
function SearchFullscreenRouter(options) {
    var stackRouter = (0, native_1.StackRouter)(options);
    return __assign(__assign({}, stackRouter), { getInitialState: function (_a) {
            var routeNames = _a.routeNames, routeParamList = _a.routeParamList, routeGetIdList = _a.routeGetIdList;
            var preservedState = (0, usePreserveNavigatorState_1.getPreservedNavigatorState)(options.parentRoute.key);
            return preservedState !== null && preservedState !== void 0 ? preservedState : stackRouter.getInitialState({ routeNames: routeNames, routeParamList: routeParamList, routeGetIdList: routeGetIdList });
        } });
}
exports.default = SearchFullscreenRouter;
