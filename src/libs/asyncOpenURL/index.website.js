"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
/**
 * Prevents Safari from blocking pop-up window when opened within async call.
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
var asyncOpenURL = function (promise, url, shouldSkipCustomSafariLogic, shouldOpenInSameTab) {
    if (!url) {
        return;
    }
    var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    var canOpenURLInSameTab = (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB;
    if (!isSafari || !!shouldSkipCustomSafariLogic || !!shouldOpenInSameTab) {
        promise
            .then(function (params) {
            react_native_1.Linking.openURL(typeof url === 'string' ? url : url(params), shouldOpenInSameTab && canOpenURLInSameTab ? '_self' : undefined);
        })
            .catch(function () {
            Log_1.default.warn('[asyncOpenURL] error occurred while opening URL', { url: url });
        });
    }
    else {
        var windowRef_1 = window.open();
        promise
            .then(function (params) {
            if (!windowRef_1) {
                return;
            }
            windowRef_1.location = typeof url === 'string' ? url : url(params);
        })
            .catch(function () {
            windowRef_1 === null || windowRef_1 === void 0 ? void 0 : windowRef_1.close();
            Log_1.default.warn('[asyncOpenURL] error occurred while opening URL', { url: url });
        });
    }
};
exports.default = asyncOpenURL;
