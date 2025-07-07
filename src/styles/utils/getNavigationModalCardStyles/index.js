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
var getNavigationModalCardStyles = function () { return (__assign({ 
    // position: fixed is set instead of position absolute to workaround Safari known issues of updating heights in DOM.
    // Safari issues:
    // https://github.com/Expensify/App/issues/12005
    // https://github.com/Expensify/App/issues/17824
    // https://github.com/Expensify/App/issues/20709
    width: '100%', height: '100%' }, positioning_1.default.pFixed)); };
exports.default = getNavigationModalCardStyles;
