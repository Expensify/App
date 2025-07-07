"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var navBarManager = {
    setButtonStyle: function (style) {
        react_native_1.NativeModules.RNNavBarManager.setButtonStyle(style);
    },
    getType: function () {
        return react_native_1.NativeModules.RNNavBarManager.getType();
    },
};
exports.default = navBarManager;
