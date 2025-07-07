"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setShouldShowComposeInput = setShouldShowComposeInput;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function setShouldShowComposeInput(shouldShowComposeInput) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.SHOULD_SHOW_COMPOSE_INPUT, shouldShowComposeInput);
}
