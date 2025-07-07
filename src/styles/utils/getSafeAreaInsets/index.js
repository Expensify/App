"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var defaultInsets_1 = require("./defaultInsets");
/**
 * Noop on web and iOS. This utility function is only needed on Android.
 * @returns
 */
function getSafeAreaInsets(safeAreaInsets) {
    var insets = safeAreaInsets !== null && safeAreaInsets !== void 0 ? safeAreaInsets : defaultInsets_1.default;
    return insets;
}
exports.default = getSafeAreaInsets;
