"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execAsync_1 = require("./execAsync");
var closeANRPopup = function (platform) {
    if (platform === void 0) { platform = 'android'; }
    if (platform !== 'android') {
        throw new Error("closeANRPopup() missing implementation for platform: ".concat(platform));
    }
    // Press "Enter" to close the ANR popup
    return (0, execAsync_1.default)("adb shell input keyevent KEYCODE_ENTER");
};
exports.default = closeANRPopup;
