"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getPlatform_1 = require("@libs/getPlatform");
var CONST_1 = require("@src/CONST");
var navBarManager = {
    setButtonStyle: function () { },
    getType: function () { return ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.IOS ? CONST_1.default.NAVIGATION_BAR_TYPE.GESTURE_BAR : CONST_1.default.NAVIGATION_BAR_TYPE.NONE); },
};
exports.default = navBarManager;
