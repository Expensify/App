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
var getBaseInfo_1 = require("./getBaseInfo");
var index_1 = require("./getOSAndName/index");
var getDeviceInfo = function () { return (__assign(__assign({}, (0, getBaseInfo_1.default)()), (0, index_1.default)())); };
exports.default = getDeviceInfo;
