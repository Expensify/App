"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CONFIG_1 = require("./CONFIG");
var CONST_1 = require("./CONST");
var Session_1 = require("./libs/actions/Session");
var SplashScreenStateContext_1 = require("./SplashScreenStateContext");
function HybridAppHandler(_a) {
    var hybridAppSettings = _a.hybridAppSettings;
    var _b = (0, react_1.useState)(false), signInHandled = _b[0], setSignInHandled = _b[1];
    var setSplashScreenState = (0, react_1.useContext)(SplashScreenStateContext_1.default).setSplashScreenState;
    if (!CONFIG_1.default.IS_HYBRID_APP || !hybridAppSettings || signInHandled) {
        return null;
    }
    (0, Session_1.signInAfterTransitionFromOldDot)(hybridAppSettings).then(function () {
        setSplashScreenState(CONST_1.default.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
        setSignInHandled(true);
    });
    return null;
}
HybridAppHandler.displayName = 'HybridAppHandler';
exports.default = HybridAppHandler;
