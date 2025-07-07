"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** Clears text that user selected by double-clicking -
 * it's not tied to virtual DOM, so sometimes it has to be cleared manually */
function clearSelectedText() {
    var _a;
    (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
}
exports.default = clearSelectedText;
