"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var setCursorPosition = function (position, ref, setSelection) {
    var _a, _b;
    var selection = {
        start: position,
        end: position,
    };
    setSelection(selection);
    (_a = ref.current) === null || _a === void 0 ? void 0 : _a.focus();
    (_b = ref.current) === null || _b === void 0 ? void 0 : _b.setNativeProps({ selection: selection });
};
exports.default = setCursorPosition;
