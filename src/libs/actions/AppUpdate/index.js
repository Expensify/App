"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApp = void 0;
exports.triggerUpdateAvailable = triggerUpdateAvailable;
exports.setIsAppInBeta = setIsAppInBeta;
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var updateApp_1 = require("./updateApp");
exports.updateApp = updateApp_1.default;
function triggerUpdateAvailable() {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.UPDATE_AVAILABLE, true);
}
function setIsAppInBeta(isBeta) {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.IS_BETA, isBeta);
}
