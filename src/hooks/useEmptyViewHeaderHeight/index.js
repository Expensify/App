"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var const_1 = require("./const");
function useEmptyViewHeaderHeight(isSmallScreenWidth, areHeaderButtonsDisplayed) {
    var BUTTONS_HEIGHT = areHeaderButtonsDisplayed ? const_1.BUTTON_HEIGHT + const_1.BUTTON_MARGIN : 0;
    return isSmallScreenWidth ? const_1.HEADER_HEIGHT + BUTTONS_HEIGHT : const_1.HEADER_HEIGHT;
}
exports.default = useEmptyViewHeaderHeight;
