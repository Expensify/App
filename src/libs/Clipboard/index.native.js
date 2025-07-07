"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clipboard_1 = require("@react-native-clipboard/clipboard");
/**
 * Sets a string on the Clipboard object via @react-native-clipboard/clipboard
 */
var setString = function (text) {
    clipboard_1.default.setString(text);
};
// We don't want to set HTML on native platforms so noop them.
var canSetHtml = function () { return false; };
var setHtml = function () { };
exports.default = {
    setString: setString,
    canSetHtml: canSetHtml,
    setHtml: setHtml,
};
