"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @return Returns `true` if the shortcut should be triggered
 */
var validateSubmitShortcut = function (isDisabled, isLoading) {
    if (isDisabled || isLoading) {
        return false;
    }
    return true;
};
exports.default = validateSubmitShortcut;
