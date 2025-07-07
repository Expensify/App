"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Timing_1 = require("@libs/actions/Timing");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
function resolveAfter(delay) {
    return new Promise(function (resolve) {
        setTimeout(resolve, delay);
    });
}
function hide() {
    Log_1.default.info('[BootSplash] hiding splash screen', false);
    return document.fonts.ready.then(function () {
        var splash = document.getElementById('splash');
        if (splash) {
            splash.style.opacity = '0';
        }
        react_native_1.InteractionManager.runAfterInteractions(function () {
            Timing_1.default.end(CONST_1.default.TIMING.SPLASH_SCREEN);
        });
        return resolveAfter(250).then(function () {
            if (!(splash === null || splash === void 0 ? void 0 : splash.parentNode)) {
                return;
            }
            splash.parentNode.removeChild(splash);
        });
    });
}
exports.default = {
    hide: hide,
    logoSizeRatio: 1,
    navigationBarHeight: 0,
};
