"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFirstValue = exports.getReturnValue = void 0;
var getReturnValue = function (value) {
    var p = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        p[_i - 1] = arguments[_i];
    }
    return (typeof value === 'function' ? value.apply(void 0, p) : value);
};
exports.getReturnValue = getReturnValue;
var getFirstValue = function (value) { return (Array.isArray(value) ? value[0] : value); };
exports.getFirstValue = getFirstValue;
