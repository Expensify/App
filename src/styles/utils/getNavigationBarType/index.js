"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var getNavigationBarType = function () {
    // On web, there is no navigation bar.
    return CONST_1.default.NAVIGATION_BAR_TYPE.NONE;
};
exports.default = getNavigationBarType;
