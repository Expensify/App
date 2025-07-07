"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = waitForAppLoaded;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
// Once we get the sidebar loaded end mark we know that the app is ready to be used:
function waitForAppLoaded() {
    return new Promise(function (resolve) {
        var connection = react_native_onyx_1.default.connect({
            key: ONYXKEYS_1.default.IS_SIDEBAR_LOADED,
            callback: function (isSidebarLoaded) {
                if (!isSidebarLoaded) {
                    return;
                }
                resolve();
                react_native_onyx_1.default.disconnect(connection);
            },
        });
    });
}
