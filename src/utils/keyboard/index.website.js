"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var Browser_1 = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
var isVisible = false;
var initialViewportHeight = (_a = window === null || window === void 0 ? void 0 : window.visualViewport) === null || _a === void 0 ? void 0 : _a.height;
var handleResize = function () {
    var _a;
    var viewportHeight = (_a = window === null || window === void 0 ? void 0 : window.visualViewport) === null || _a === void 0 ? void 0 : _a.height;
    if (!viewportHeight || !initialViewportHeight) {
        return;
    }
    // Determine if the keyboard is visible by checking if the height difference exceeds 152px.
    // The 152px threshold accounts for UI elements such as smart banners on iOS Retina (max ~152px)
    // and smaller overlays like offline indicators on Android. Height differences > 152px reliably indicate keyboard visibility.
    isVisible = initialViewportHeight - viewportHeight > CONST_1.default.SMART_BANNER_HEIGHT;
};
(_b = window.visualViewport) === null || _b === void 0 ? void 0 : _b.addEventListener('resize', handleResize);
var dismiss = function () {
    return new Promise(function (resolve) {
        var _a;
        if (!isVisible || !(0, Browser_1.isMobile)()) {
            resolve();
            return;
        }
        var handleDismissResize = function () {
            var _a, _b;
            var viewportHeight = (_a = window === null || window === void 0 ? void 0 : window.visualViewport) === null || _a === void 0 ? void 0 : _a.height;
            if (!viewportHeight || !initialViewportHeight) {
                return;
            }
            var isKeyboardVisible = initialViewportHeight - viewportHeight > CONST_1.default.SMART_BANNER_HEIGHT;
            if (isKeyboardVisible) {
                return;
            }
            (_b = window.visualViewport) === null || _b === void 0 ? void 0 : _b.removeEventListener('resize', handleDismissResize);
            return resolve();
        };
        (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.addEventListener('resize', handleDismissResize);
        react_native_1.Keyboard.dismiss();
    });
};
var utils = { dismiss: dismiss };
exports.default = utils;
