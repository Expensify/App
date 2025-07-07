"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateStatusBarAppearance;
var StatusBar_1 = require("@libs/StatusBar");
function updateStatusBarAppearance(_a) {
    var backgroundColor = _a.backgroundColor, statusBarStyle = _a.statusBarStyle;
    if (backgroundColor) {
        StatusBar_1.default.setBackgroundColor(backgroundColor, true);
    }
    if (statusBarStyle) {
        StatusBar_1.default.setBarStyle(statusBarStyle, true);
    }
}
