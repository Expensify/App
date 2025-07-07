"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Adds the addOutlineWidth property to an object to be used when styling
 */
var addOutlineWidth = function (theme, obj, val, hasError) {
    if (hasError === void 0) { hasError = false; }
    return (__assign(__assign({}, obj), { outlineWidth: val, outlineStyle: val ? 'auto' : 'none', boxShadow: val !== 0 ? "0px 0px 0px ".concat(val, "px ").concat(hasError ? theme.danger : theme.borderFocus) : 'none' }));
};
exports.default = addOutlineWidth;
