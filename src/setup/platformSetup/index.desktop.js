"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_native_1 = require("react-native");
var ELECTRON_EVENTS_1 = require("@desktop/ELECTRON_EVENTS");
var DateUtils_1 = require("@libs/DateUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var LocalNotification_1 = require("@libs/Notification/LocalNotification");
var CONFIG_1 = require("@src/CONFIG");
var ROUTES_1 = require("@src/ROUTES");
function default_1() {
    react_native_1.AppRegistry.runApplication(CONFIG_1.default.APP_NAME, {
        rootTag: document.getElementById('root'),
    });
    // Send local notification when update is downloaded
    window.electron.on(ELECTRON_EVENTS_1.default.UPDATE_DOWNLOADED, function () {
        LocalNotification_1.default.showUpdateAvailableNotification();
    });
    // Trigger action to show keyboard shortcuts
    window.electron.on(ELECTRON_EVENTS_1.default.KEYBOARD_SHORTCUTS_PAGE, function () {
        Navigation_1.default.navigate(ROUTES_1.default.KEYBOARD_SHORTCUTS);
    });
    // Start current date updater
    DateUtils_1.default.startCurrentDateUpdater();
}
