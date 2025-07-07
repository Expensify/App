"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getOperatingSystem_1 = require("@libs/getOperatingSystem");
var CONST_1 = require("@src/CONST");
var index_ios_1 = require("./index.ios");
var getPermittedDecimalSeparator = function (localizedSeparator) {
    if ((0, getOperatingSystem_1.default)() === CONST_1.default.OS.IOS) {
        return (0, index_ios_1.default)(localizedSeparator);
    }
    return localizedSeparator;
};
exports.default = getPermittedDecimalSeparator;
