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
var clipboard_1 = require("@react-native-clipboard/clipboard");
var Browser = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
var canSetHtml = function () {
    return function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return (_a = navigator === null || navigator === void 0 ? void 0 : navigator.clipboard) === null || _a === void 0 ? void 0 : _a.write(__spreadArray([], args, true));
    };
};
/**
 * Deprecated method to write the content as HTML to clipboard.
 */
function setHTMLSync(html, text) {
    var _a;
    var node = document.createElement('span');
    node.textContent = html;
    node.style.all = 'unset';
    node.style.opacity = '0';
    node.style.position = 'absolute';
    node.style.whiteSpace = 'pre-wrap';
    node.style.userSelect = 'text';
    node.addEventListener('copy', function (e) {
        var _a, _b, _c;
        e.stopPropagation();
        e.preventDefault();
        (_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.clearData();
        (_b = e.clipboardData) === null || _b === void 0 ? void 0 : _b.setData('text/html', html);
        (_c = e.clipboardData) === null || _c === void 0 ? void 0 : _c.setData('text/plain', text);
    });
    document.body.appendChild(node);
    var selection = window === null || window === void 0 ? void 0 : window.getSelection();
    if (selection === null) {
        return;
    }
    var firstAnchorChild = (_a = selection.anchorNode) === null || _a === void 0 ? void 0 : _a.firstChild;
    var isComposer = firstAnchorChild instanceof HTMLTextAreaElement;
    var originalSelection = null;
    if (isComposer) {
        originalSelection = {
            start: firstAnchorChild.selectionStart,
            end: firstAnchorChild.selectionEnd,
            direction: firstAnchorChild.selectionDirection,
        };
    }
    else {
        originalSelection = {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset,
        };
    }
    selection.removeAllRanges();
    var range = document.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);
    try {
        document.execCommand('copy');
    }
    catch (e) {
        // The 'copy' command can throw a SecurityError exception, we ignore this exception on purpose.
        // See https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-copy-command for more details.
    }
    selection.removeAllRanges();
    var anchorSelection = originalSelection;
    if (isComposer && 'start' in originalSelection) {
        firstAnchorChild.setSelectionRange(originalSelection.start, originalSelection.end, originalSelection.direction);
    }
    else if (anchorSelection.anchorNode && anchorSelection.focusNode) {
        // When copying to the clipboard here, the original values of anchorNode and focusNode will be null since there will be no user selection.
        // We are adding a check to prevent null values from being passed to setBaseAndExtent, in accordance with the standards of the Selection API as outlined here: https://w3c.github.io/selection-api/#dom-selection-setbaseandextent.
        selection.setBaseAndExtent(anchorSelection.anchorNode, anchorSelection.anchorOffset, anchorSelection.focusNode, anchorSelection.focusOffset);
    }
    document.body.removeChild(node);
}
/**
 * Writes the content as HTML if the web client supports it.
 */
var setHtml = function (html, text) {
    if (!html || !text) {
        return;
    }
    if (!canSetHtml()) {
        throw new Error('clipboard.write is not supported on this platform, thus HTML cannot be copied.');
    }
    if (CONST_1.default.BROWSER.SAFARI === Browser.getBrowser()) {
        // Safari sanitize "text/html" data before writing to the pasteboard when using Clipboard API,
        // whitespaces in the start of line are stripped away. We use the deprecated method to copy
        // contents as HTML and keep whitespaces in the start of line on Safari.
        // See https://webkit.org/blog/10855/async-clipboard-api/ for more details.
        setHTMLSync(html, text);
    }
    else {
        var htmlNonClosingTags = html
            .replace(/<mention-report reportID="(\d+)" *\/>/gi, '<mention-report reportID="$1"></mention-report>')
            .replace(/<mention-user accountID="(\d+)" *\/>/gi, '<mention-user accountID="$1"></mention-user>');
        navigator.clipboard.write([
            new ClipboardItem({
                /* eslint-disable @typescript-eslint/naming-convention */
                'text/html': new Blob([htmlNonClosingTags], { type: 'text/html' }),
                'text/plain': new Blob([text], { type: 'text/plain' }),
            }),
        ]);
    }
};
/**
 * Sets a string on the Clipboard object via react-native-web
 */
var setString = function (text) {
    clipboard_1.default.setString(text);
};
exports.default = {
    setString: setString,
    canSetHtml: canSetHtml,
    setHtml: setHtml,
};
