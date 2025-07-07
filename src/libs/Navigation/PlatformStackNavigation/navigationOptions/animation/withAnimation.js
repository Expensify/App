"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fade_1 = require("./fade");
var index_1 = require("./index");
var none_1 = require("./none");
var slideFromBottom_1 = require("./slideFromBottom");
var slideFromLeft_1 = require("./slideFromLeft");
var slideFromRight_1 = require("./slideFromRight");
function withAnimation(screenOptions) {
    switch (screenOptions === null || screenOptions === void 0 ? void 0 : screenOptions.animation) {
        case index_1.default.SLIDE_FROM_LEFT:
            return slideFromLeft_1.default;
        case index_1.default.SLIDE_FROM_RIGHT:
            return slideFromRight_1.default;
        case index_1.default.SLIDE_FROM_BOTTOM:
            return slideFromBottom_1.default;
        case index_1.default.NONE:
            return none_1.default;
        case index_1.default.FADE:
            return fade_1.default;
        default:
            return {};
    }
}
exports.default = withAnimation;
