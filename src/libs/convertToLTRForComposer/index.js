"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
function hasRTLCharacters(text) {
    // Regular expressions to match RTL character ranges.
    var rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlPattern.test(text);
}
// Converts a given text to ensure it starts with the LTR (Left-to-Right) marker.
var convertToLTRForComposer = function (text) {
    // Ensure that the text starts with RTL characters if not we return the same text to avoid concatenation with special
    // character at the start which leads to unexpected behaviour for Emoji/Mention suggestions.
    if (!hasRTLCharacters(text)) {
        // If text is empty string return empty string to avoid an empty draft due to special character.
        return text.replace(CONST_1.default.UNICODE.LTR, '');
    }
    // Check if the text contains only spaces. If it does, we do not concatenate it with CONST.UNICODE.LTR,
    // as doing so would alter the normal behavior of the input box.
    if (/^\s*$/.test(text)) {
        return text;
    }
    // Check if the text already starts with the LTR marker (if so, return as is).
    if (text.startsWith(CONST_1.default.UNICODE.LTR)) {
        return text;
    }
    // Add the LTR marker to the beginning of the text.
    return "".concat(CONST_1.default.UNICODE.LTR).concat(text);
};
exports.default = convertToLTRForComposer;
