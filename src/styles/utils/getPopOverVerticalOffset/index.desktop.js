"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
/** Adds the header padding with vertical offset on desktop */
var getPopOverVerticalOffset = function (vertical) { return ({
    // We add CONST.DESKTOP_HEADER_GAP on desktop which we
    // need to add to vertical offset to have proper vertical
    // offset on desktop
    vertical: vertical + CONST_1.default.DESKTOP_HEADER_PADDING,
}); };
exports.default = getPopOverVerticalOffset;
