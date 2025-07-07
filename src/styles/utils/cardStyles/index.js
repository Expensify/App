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
var positioning_1 = require("@styles/utils/positioning");
/**
 * Get card style for cardStyleInterpolator
 */
var getCardStyles = function (screenWidth) { return (__assign(__assign({}, positioning_1.default.pFixed), { width: screenWidth, height: '100%' })); };
exports.default = getCardStyles;
