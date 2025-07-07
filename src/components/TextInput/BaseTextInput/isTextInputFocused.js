"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isTextInputFocused;
/** Checks that text input has the isFocused method and is focused. */
function isTextInputFocused(textInput) {
    return textInput.current && 'isFocused' in textInput.current && textInput.current.isFocused();
}
