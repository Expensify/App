"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execAsync_1 = require("../utils/execAsync");
var Logger = require("../utils/logger");
var adbBackspace = function () {
    Logger.log("\uD83D\uDD19 Pressing backspace");
    return (0, execAsync_1.default)("adb shell input keyevent KEYCODE_DEL").then(function () { return true; });
};
exports.default = adbBackspace;
