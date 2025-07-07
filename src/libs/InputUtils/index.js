"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrollToRight = exports.moveSelectionToEnd = exports.scrollToBottom = void 0;
var scrollToBottom = function (input) {
    if (!('scrollTop' in input)) {
        return;
    }
    // eslint-disable-next-line no-param-reassign
    input.scrollTop = input.scrollHeight;
};
exports.scrollToBottom = scrollToBottom;
var scrollToRight = function (input) {
    if (!('scrollLeft' in input)) {
        return;
    }
    // Scroll to the far right
    // eslint-disable-next-line no-param-reassign
    input.scrollLeft = input.scrollWidth;
};
exports.scrollToRight = scrollToRight;
var moveSelectionToEnd = function (input) {
    if (!('setSelectionRange' in input)) {
        return;
    }
    var length = input.value.length;
    input.setSelectionRange(length, length);
};
exports.moveSelectionToEnd = moveSelectionToEnd;
