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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var withAnimation_1 = require("./animation/withAnimation");
var getCommonNavigationOptions = function (screenOptions) {
    return screenOptions === undefined ? {} : (function (_a) {
        var animation = _a.animation, keyboardHandlingEnabled = _a.keyboardHandlingEnabled, web = _a.web, native = _a.native, rest = __rest(_a, ["animation", "keyboardHandlingEnabled", "web", "native"]);
        return rest;
    })(screenOptions);
};
var buildPlatformSpecificNavigationOptions = function (screenOptions) { return (__assign(__assign({ keyboardHandlingEnabled: screenOptions.keyboardHandlingEnabled }, (0, withAnimation_1.default)(screenOptions)), getCommonNavigationOptions(screenOptions))); };
exports.default = buildPlatformSpecificNavigationOptions;
