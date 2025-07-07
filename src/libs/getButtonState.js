"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Get the string representation of a button's state.
 */
function getButtonState(isActive, isPressed, isComplete, isDisabled, isInteractive) {
    if (isActive === void 0) { isActive = false; }
    if (isPressed === void 0) { isPressed = false; }
    if (isComplete === void 0) { isComplete = false; }
    if (isDisabled === void 0) { isDisabled = false; }
    if (isInteractive === void 0) { isInteractive = true; }
    if (!isInteractive) {
        return CONST_1.default.BUTTON_STATES.DEFAULT;
    }
    if (isDisabled) {
        return CONST_1.default.BUTTON_STATES.DISABLED;
    }
    if (isComplete) {
        return CONST_1.default.BUTTON_STATES.COMPLETE;
    }
    if (isPressed) {
        return CONST_1.default.BUTTON_STATES.PRESSED;
    }
    if (isActive) {
        return CONST_1.default.BUTTON_STATES.ACTIVE;
    }
    return CONST_1.default.BUTTON_STATES.DEFAULT;
}
exports.default = getButtonState;
