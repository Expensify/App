"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moveAccessibilityFocus = function (ref) {
    if (!(ref === null || ref === void 0 ? void 0 : ref.current)) {
        return;
    }
    ref.current.focus();
};
exports.default = moveAccessibilityFocus;
