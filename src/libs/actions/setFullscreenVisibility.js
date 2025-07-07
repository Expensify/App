"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setFullscreenVisibility;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setFullscreenVisibility(isVisible) {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FULLSCREEN_VISIBILITY, isVisible);
}
