"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useCopySelectionHelper;
var react_1 = require("react");
var Clipboard_1 = require("@libs/Clipboard");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var Parser_1 = require("@libs/Parser");
var SelectionScraper_1 = require("@libs/SelectionScraper");
var CONST_1 = require("@src/CONST");
function copySelectionToClipboard() {
    var selection = SelectionScraper_1.default.getCurrentSelection();
    if (!selection) {
        return;
    }
    if (!Clipboard_1.default.canSetHtml()) {
        Clipboard_1.default.setString(Parser_1.default.htmlToMarkdown(selection));
        return;
    }
    Clipboard_1.default.setHtml(selection, Parser_1.default.htmlToText(selection));
}
function useCopySelectionHelper() {
    (0, react_1.useEffect)(function () {
        var copyShortcutConfig = CONST_1.default.KEYBOARD_SHORTCUTS.COPY;
        var unsubscribeCopyShortcut = KeyboardShortcut_1.default.subscribe(copyShortcutConfig.shortcutKey, copySelectionToClipboard, copyShortcutConfig.descriptionKey, __spreadArray([], copyShortcutConfig.modifiers, true), false);
        return function () {
            unsubscribeCopyShortcut();
        };
    }, []);
}
