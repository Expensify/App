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
var spacing_1 = require("@styles/utils/spacing");
var getHighResolutionInfoWrapperStyle = function (isUploaded) { return (__assign(__assign(__assign({}, spacing_1.default.ph5), spacing_1.default.pt5), (isUploaded ? spacing_1.default.pb5 : spacing_1.default.mbn1))); };
exports.default = getHighResolutionInfoWrapperStyle;
