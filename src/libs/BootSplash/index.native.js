"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Timing_1 = require("@libs/actions/Timing");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
var BootSplash = react_native_1.NativeModules.BootSplash;
function hide() {
    Log_1.default.info('[BootSplash] hiding splash screen', false);
    return BootSplash.hide().finally(function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            Timing_1.default.end(CONST_1.default.TIMING.SPLASH_SCREEN);
        });
    });
}
exports.default = {
    hide: hide,
    logoSizeRatio: BootSplash.logoSizeRatio || 1,
    navigationBarHeight: BootSplash.navigationBarHeight || 0,
};
