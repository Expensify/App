"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var setCursorPosition = function (position, ref, setSelection) {
    var _a;
    setSelection({
        start: position,
        end: position,
    });
    (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus();
};
exports.default = setCursorPosition;
