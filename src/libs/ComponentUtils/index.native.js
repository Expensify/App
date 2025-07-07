"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCESSIBILITY_ROLE_FORM = void 0;
exports.forceClearInput = forceClearInput;
var react_native_reanimated_1 = require("react-native-reanimated");
var ACCESSIBILITY_ROLE_FORM = 'none';
exports.ACCESSIBILITY_ROLE_FORM = ACCESSIBILITY_ROLE_FORM;
/**
 * Clears a text input on the UI thread using a custom clear command
 * that bypasses the event count check.
 */
function forceClearInput(animatedInputRef) {
    'worklet';
    (0, react_native_reanimated_1.dispatchCommand)(animatedInputRef, 'clear');
}
