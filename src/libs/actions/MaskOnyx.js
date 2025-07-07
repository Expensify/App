"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setShouldMaskOnyxState = setShouldMaskOnyxState;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setShouldMaskOnyxState(shouldMask) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.SHOULD_MASK_ONYX_STATE, shouldMask);
}
