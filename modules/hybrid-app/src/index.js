"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HybridAppModule = {
    isHybridApp: function () {
        return false;
    },
    shouldUseStaging: function () {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `shouldUseStaging` should never be called on web');
    },
    closeReactNativeApp: function () {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `closeReactNativeApp` should never be called on web');
    },
    completeOnboarding: function () {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `completeOnboarding` should never be called on web');
    },
    switchAccount: function () {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `switchAccount` should never be called on web');
    },
    sendAuthToken: function () {
        // eslint-disable-next-line no-console
        console.warn('HybridAppModule: `sendAuthToken` should never be called on web');
    },
};
exports.default = HybridAppModule;
