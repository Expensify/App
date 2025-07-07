"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var execAsync_1 = require("./execAsync");
var killApp = function (platform, packageName) {
    if (platform === void 0) { platform = 'android'; }
    if (packageName === void 0) { packageName = config_1.default.MAIN_APP_PACKAGE; }
    if (platform !== 'android') {
        throw new Error("killApp() missing implementation for platform: ".concat(platform));
    }
    // Use adb to kill the app
    return (0, execAsync_1.default)("adb shell am force-stop ".concat(packageName));
};
exports.default = killApp;
