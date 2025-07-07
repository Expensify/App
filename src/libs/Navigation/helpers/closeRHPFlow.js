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
exports.default = closeRHPFlow;
var native_1 = require("@react-navigation/native");
var Log_1 = require("@libs/Log");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
/**
 * Closes the last RHP flow, if there is only one, closes the entire RHP.
 */
function closeRHPFlow(navigationRef) {
    var _a, _b, _c;
    if (!navigationRef.isReady()) {
        return;
    }
    var state = navigationRef.getState();
    var lastRoute = state.routes.at(-1);
    var isLastRouteRHP = (lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.name) === NAVIGATORS_1.default.RIGHT_MODAL_NAVIGATOR;
    if (!isLastRouteRHP) {
        Log_1.default.warn('RHP Navigator has not been found when calling closeRHPFlow function');
        return;
    }
    var target = state.key;
    var hasMoreThanOneRoute = ((_b = (_a = lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.state) === null || _a === void 0 ? void 0 : _a.routes) === null || _b === void 0 ? void 0 : _b.length) && lastRoute.state.routes.length > 1;
    if (((_c = lastRoute === null || lastRoute === void 0 ? void 0 : lastRoute.state) === null || _c === void 0 ? void 0 : _c.key) && hasMoreThanOneRoute) {
        target = lastRoute.state.key;
    }
    navigationRef.dispatch(__assign(__assign({}, native_1.StackActions.pop()), { target: target }));
}
