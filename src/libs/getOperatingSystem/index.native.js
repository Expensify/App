"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
/**
 * Reads the current operating system for native platforms.
 */
var getOperatingSystem = function () {
    switch (react_native_1.Platform.OS) {
        case 'ios':
            return CONST_1.default.OS.IOS;
        case 'android':
            return CONST_1.default.OS.ANDROID;
        default:
            return CONST_1.default.OS.NATIVE;
    }
};
exports.default = getOperatingSystem;
