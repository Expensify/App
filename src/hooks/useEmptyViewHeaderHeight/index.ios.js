"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var const_1 = require("./const");
function useEmptyViewHeaderHeight(isSmallScreenWidth, areHeaderButtonsDisplayed) {
    var safeAreaInsets = (0, useSafeAreaInsets_1.default)();
    var BUTTONS_HEIGHT = areHeaderButtonsDisplayed ? const_1.BUTTON_HEIGHT + const_1.BUTTON_MARGIN : 0;
    return isSmallScreenWidth ? const_1.HEADER_HEIGHT + BUTTONS_HEIGHT + safeAreaInsets.top : const_1.HEADER_HEIGHT;
}
exports.default = useEmptyViewHeaderHeight;
