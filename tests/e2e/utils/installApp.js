"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var execAsync_1 = require("./execAsync");
var Logger = require("./logger");
/**
 * Installs the app on the currently connected device for the given platform.
 * It removes the app first if it already exists, so it's a clean installation.
 */
function default_1(packageName, path, platform, flag) {
    if (platform === void 0) { platform = 'android'; }
    if (flag === void 0) { flag = ''; }
    if (platform !== 'android') {
        throw new Error("installApp() missing implementation for platform: ".concat(platform));
    }
    var installCommand = flag ? "adb install ".concat(flag) : 'adb install';
    // Uninstall first, then install
    return ((0, execAsync_1.default)("adb uninstall ".concat(packageName))
        .catch(function (error) {
        // Ignore errors
        Logger.warn('Failed to uninstall app:', error.message);
    })
        // install and grant push notifications permissions right away (the popup may block e2e tests sometimes)
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        .finally(function () {
        // install the app
        return (0, execAsync_1.default)("".concat(installCommand, " ").concat(path)).then(function () {
            // and grant push notifications permissions right away (the popup may block e2e tests sometimes)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return (0, execAsync_1.default)("adb shell pm grant ".concat(packageName.split('/').at(0), " android.permission.POST_NOTIFICATIONS")).catch(function (_) {
                // in case of error - just log it and continue (if we request this permission on Android < 13 it'll fail because there is no such permission)
                return Logger.warn('Failed to grant push notifications permissions. It might be due to the fact that push-notifications permission type is not supported on this OS version yet. Continue tests execution...');
            });
        });
    }));
}
