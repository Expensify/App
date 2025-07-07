"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
/**
 * Stop the startup trace for the app.
 */
var startupTimer = {
    stop: function () {
        react_native_1.NativeModules.StartupTimer.stop();
    },
};
exports.default = startupTimer;
