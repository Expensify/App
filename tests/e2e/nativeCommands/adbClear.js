"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execAsync_1 = require("../utils/execAsync");
var Logger = require("../utils/logger");
var adbClear = function () {
    Logger.log("\uD83E\uDDF9 Clearing the typed text");
    return (0, execAsync_1.default)("\n      function clear_input() {\n          adb shell input keyevent KEYCODE_MOVE_END\n          # delete up to 2 characters per 1 press, so 1..3 will delete up to 6 characters\n          adb shell input keyevent --longpress $(printf 'KEYCODE_DEL %.0s' {1..3})\n      }\n\n      clear_input\n    ").then(function () { return true; });
};
exports.default = adbClear;
