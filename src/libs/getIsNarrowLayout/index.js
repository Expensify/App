"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getIsNarrowLayout;
var getIsSmallScreenWidth_1 = require("@libs/getIsSmallScreenWidth");
function getIsNarrowLayout() {
    return (0, getIsSmallScreenWidth_1.default)();
}
