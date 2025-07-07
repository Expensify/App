"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = updateApp;
var react_native_1 = require("react-native");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
function updateApp(isProduction) {
    if (isProduction) {
        react_native_1.Linking.openURL(CONST_1.default.APP_DOWNLOAD_LINKS.OLD_DOT_IOS);
        return;
    }
    react_native_1.Linking.openURL(CONFIG_1.default.IS_HYBRID_APP ? CONST_1.default.APP_DOWNLOAD_LINKS.OLD_DOT_IOS : CONST_1.default.APP_DOWNLOAD_LINKS.IOS);
}
