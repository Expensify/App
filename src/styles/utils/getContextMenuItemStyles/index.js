"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var variables_1 = require("@styles/variables");
var getContextMenuItemStyles = function (styles, windowWidth) {
    if (windowWidth && windowWidth > variables_1.default.mobileResponsiveWidthBreakpoint) {
        return [styles.popoverMenuItem, styles.contextMenuItemPopoverMaxWidth];
    }
    return [styles.popoverMenuItem];
};
exports.default = getContextMenuItemStyles;
