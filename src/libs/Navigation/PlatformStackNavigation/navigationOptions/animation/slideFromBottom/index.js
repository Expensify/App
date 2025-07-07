"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gestureDirection_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection");
var __1 = require("..");
var slideFromBottom = {
    animation: __1.InternalPlatformAnimations.SLIDE_FROM_BOTTOM,
    gestureDirection: gestureDirection_1.default.VERTICAL,
};
exports.default = slideFromBottom;
