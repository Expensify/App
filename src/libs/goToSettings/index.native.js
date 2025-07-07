"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var saveLastRoute_1 = require("@libs/saveLastRoute");
function goToSettings() {
    react_native_1.Linking.openSettings();
    // In the case of ios, the App reloads when we update contact permission from settings
    // we are saving last route so we can navigate to it after app reload
    (0, saveLastRoute_1.default)();
}
exports.default = goToSettings;
