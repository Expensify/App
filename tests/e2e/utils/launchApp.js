"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var execAsync_1 = require("./execAsync");
var launchApp = function (platform, packageName, activityPath, launchArgs) {
    if (platform === void 0) { platform = 'android'; }
    if (packageName === void 0) { packageName = config_1.default.MAIN_APP_PACKAGE; }
    if (activityPath === void 0) { activityPath = config_1.default.ACTIVITY_PATH; }
    if (launchArgs === void 0) { launchArgs = {}; }
    if (platform !== 'android') {
        throw new Error("launchApp() missing implementation for platform: ".concat(platform));
    }
    // Use adb to start the app
    var launchArgsString = Object.keys(launchArgs)
        .map(function (key) { return "".concat(typeof launchArgs[key] === 'boolean' ? '--ez' : '--es', " ").concat(key, " ").concat(launchArgs[key]); })
        .join(' ');
    return (0, execAsync_1.default)("adb shell am start -n ".concat(packageName, "/").concat(activityPath, " ").concat(launchArgsString));
};
exports.default = launchApp;
