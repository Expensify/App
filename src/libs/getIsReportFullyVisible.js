"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getIsReportFullyVisible;
var Visibility_1 = require("./Visibility");
/**
 * When the app is visible and the report screen is focused we can assume that the report is fully visible.
 */
function getIsReportFullyVisible(isFocused) {
    return Visibility_1.default.isVisible() && isFocused;
}
