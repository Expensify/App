"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NativeReactNativeHybridApp_1 = require("./NativeReactNativeHybridApp");
var HybridAppModule = {
    isHybridApp: function () {
        return NativeReactNativeHybridApp_1.default.isHybridApp();
    },
    shouldUseStaging: function (isStaging) {
        NativeReactNativeHybridApp_1.default.shouldUseStaging(isStaging);
    },
    closeReactNativeApp: function (_a) {
        var shouldSignOut = _a.shouldSignOut, shouldSetNVP = _a.shouldSetNVP;
        NativeReactNativeHybridApp_1.default.closeReactNativeApp(shouldSignOut, shouldSetNVP);
    },
    completeOnboarding: function (_a) {
        var status = _a.status;
        NativeReactNativeHybridApp_1.default.completeOnboarding(status);
    },
    switchAccount: function (_a) {
        var newDotCurrentAccountEmail = _a.newDotCurrentAccountEmail, authToken = _a.authToken, policyID = _a.policyID, accountID = _a.accountID;
        NativeReactNativeHybridApp_1.default.switchAccount(newDotCurrentAccountEmail, authToken, policyID, accountID);
    },
    sendAuthToken: function (_a) {
        var authToken = _a.authToken;
        NativeReactNativeHybridApp_1.default.sendAuthToken(authToken);
    },
};
exports.default = HybridAppModule;
