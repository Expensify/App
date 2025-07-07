"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var execAsync_1 = require("../utils/execAsync");
var Logger = require("../utils/logger");
var adbTypeText = function (text) {
    Logger.log("\uD83D\uDCDD Typing text: ".concat(text));
    return (0, execAsync_1.default)("adb shell input text \"".concat(text, "\"")).then(function () { return true; });
};
exports.default = adbTypeText;
