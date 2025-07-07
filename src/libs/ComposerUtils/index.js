"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertText = insertText;
exports.canSkipTriggerHotkeys = canSkipTriggerHotkeys;
exports.insertWhiteSpaceAtIndex = insertWhiteSpaceAtIndex;
exports.findCommonSuffixLength = findCommonSuffixLength;
var DeviceCapabilities = require("@libs/DeviceCapabilities");
/**
 * Replace substring between selection with a text.
 */
function insertText(text, selection, textToInsert) {
    return text.slice(0, selection.start) + textToInsert + text.slice(selection.end, text.length);
}
/**
 * Insert a white space at given index of text
 * @param text - text that needs whitespace to be appended to
 */
function insertWhiteSpaceAtIndex(text, index) {
    return "".concat(text.slice(0, index), " ").concat(text.slice(index));
}
/**
 * Check whether we can skip trigger hotkeys on some specific devices.
 */
function canSkipTriggerHotkeys(isSmallScreenWidth, isKeyboardShown) {
    // Do not trigger actions for mobileWeb or native clients that have the keyboard open
    // because for those devices, we want the return key to insert newlines rather than submit the form
    return (isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen()) || isKeyboardShown;
}
/**
 * Finds the length of common suffix between two texts
 */
function findCommonSuffixLength(str1, str2, cursorPosition) {
    var commonSuffixLength = 0;
    var minLength = Math.min(str1.length - cursorPosition, str2.length);
    for (var i = 1; i <= minLength; i++) {
        if (str1.charAt(str1.length - i) === str2.charAt(str2.length - i)) {
            commonSuffixLength++;
        }
        else {
            break;
        }
    }
    return commonSuffixLength;
}
