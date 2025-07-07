"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function callOrReturn(value) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (typeof value === 'function') {
        return value.apply(void 0, args);
    }
    return value;
}
exports.default = callOrReturn;
