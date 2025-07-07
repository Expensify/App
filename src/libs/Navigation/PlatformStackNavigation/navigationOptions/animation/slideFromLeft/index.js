"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gestureDirection_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/gestureDirection");
var __1 = require("..");
var slideFromLeft = {
    animation: __1.InternalPlatformAnimations.SLIDE_FROM_LEFT,
    gestureDirection: gestureDirection_1.default.HORIZONTAL_INVERTED,
};
exports.default = slideFromLeft;
