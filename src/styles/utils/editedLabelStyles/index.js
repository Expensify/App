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
// eslint-disable-next-line no-restricted-imports
var display_1 = require("@styles/utils/display");
// eslint-disable-next-line no-restricted-imports
var flex_1 = require("@styles/utils/flex");
var editedLabelStyles = __assign(__assign({}, display_1.default.dInlineFlex), flex_1.default.alignItemsBaseline);
exports.default = editedLabelStyles;
