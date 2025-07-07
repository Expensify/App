"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NavBarManager_1 = require("@libs/NavBarManager");
var CONST_1 = require("@src/CONST");
var getNavigationBarType = function (insets) {
    var _a;
    var bottomInset = (_a = insets === null || insets === void 0 ? void 0 : insets.bottom) !== null && _a !== void 0 ? _a : 0;
    // If the bottom safe area inset is 0, we consider the device to have no navigation bar (or it being hidden by default).
    // This could be mean either hidden soft keys, gesture navigation without a gesture bar or physical buttons.
    if (bottomInset === 0) {
        return CONST_1.default.NAVIGATION_BAR_TYPE.NONE;
    }
    return NavBarManager_1.default.getType();
};
exports.default = getNavigationBarType;
