"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultInsets_1 = require("./defaultInsets");
/**
 * On Android we want to use the StatusBar height rather than the top safe area inset.
 * @returns
 */
function getSafeAreaInsets(safeAreaInsets) {
    var insets = safeAreaInsets !== null && safeAreaInsets !== void 0 ? safeAreaInsets : defaultInsets_1.default;
    return insets;
}
exports.default = getSafeAreaInsets;
