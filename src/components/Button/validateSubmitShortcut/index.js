"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @param event Focused input event
 * @returns Returns `true` if the shortcut should be triggered
 */
var validateSubmitShortcut = function (isDisabled, isLoading, event) {
    var eventTarget = event === null || event === void 0 ? void 0 : event.target;
    if (isDisabled ||
        isLoading ||
        eventTarget.nodeName === CONST_1.default.ELEMENT_NAME.TEXTAREA ||
        (eventTarget.nodeName === CONST_1.default.ELEMENT_NAME.INPUT && eventTarget.autocomplete === 'one-time-code') ||
        ((eventTarget === null || eventTarget === void 0 ? void 0 : eventTarget.contentEditable) === 'true' && eventTarget.ariaMultiLine)) {
        return false;
    }
    event === null || event === void 0 ? void 0 : event.preventDefault();
    return true;
};
exports.default = validateSubmitShortcut;
