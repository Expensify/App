"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getScrollPosition(_a) {
    var textInputRef = _a.textInputRef;
    var scrollValue = 0;
    if (textInputRef === null || textInputRef === void 0 ? void 0 : textInputRef.current) {
        if ('scrollTop' in textInputRef.current) {
            scrollValue = textInputRef.current.scrollTop;
        }
    }
    return { scrollValue: scrollValue };
}
exports.default = getScrollPosition;
