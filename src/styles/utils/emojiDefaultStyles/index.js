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
var FontUtils_1 = require("@styles/utils/FontUtils");
var emojiDefaultStyles = __assign(__assign({}, FontUtils_1.default.fontFamily.platform.EXP_NEUE), display_1.default.dInline);
exports.default = emojiDefaultStyles;
