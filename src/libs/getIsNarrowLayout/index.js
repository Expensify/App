"use strict";
exports.__esModule = true;
var getIsSmallScreenWidth_1 = require("@libs/getIsSmallScreenWidth");
function getIsNarrowLayout() {
    return getIsSmallScreenWidth_1["default"]();
}
exports["default"] = getIsNarrowLayout;
