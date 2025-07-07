"use strict";
/**
 * We are disabling the lint rule that doesn't allow the usage of Onyx.connect outside libs
 * because the intent of this file is to mock the usage of react-native-onyx so we will have to mock the connect function
 */
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
exports.useOnyx = exports.withOnyx = void 0;
// eslint-disable-next-line no-restricted-imports
var react_native_onyx_1 = require("react-native-onyx");
Object.defineProperty(exports, "useOnyx", { enumerable: true, get: function () { return react_native_onyx_1.useOnyx; } });
Object.defineProperty(exports, "withOnyx", { enumerable: true, get: function () { return react_native_onyx_1.withOnyx; } });
var connectCallbackDelay = 0;
function addDelayToConnectCallback(delay) {
    connectCallbackDelay = delay;
}
var reactNativeOnyxMock = __assign(__assign({}, react_native_onyx_1.default), { connect: function (mapping) {
        var callback = function () {
            var _a;
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            if (connectCallbackDelay > 0) {
                setTimeout(function () {
                    var _a;
                    (_a = mapping.callback) === null || _a === void 0 ? void 0 : _a.call.apply(_a, __spreadArray([mapping], params, false));
                }, connectCallbackDelay);
            }
            else {
                (_a = mapping.callback) === null || _a === void 0 ? void 0 : _a.call.apply(_a, __spreadArray([mapping], params, false));
            }
        };
        return react_native_onyx_1.default.connect(__assign(__assign({}, mapping), { callback: callback }));
    }, addDelayToConnectCallback: addDelayToConnectCallback });
exports.default = reactNativeOnyxMock;
