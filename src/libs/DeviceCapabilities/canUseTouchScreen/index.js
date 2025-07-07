"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Allows us to identify whether the platform has a touchscreen.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent
 */
var canUseTouchScreen = function () {
    var _a;
    var hasTouchScreen = false;
    // TypeScript removed support for msMaxTouchPoints, this doesn't mean however that
    // this property doesn't exist - hence the use of ExtendedNavigator to ensure
    // that the functionality doesn't change
    // https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029
    if ('maxTouchPoints' in navigator) {
        hasTouchScreen = navigator.maxTouchPoints > 0;
    }
    else if ('msMaxTouchPoints' in navigator) {
        hasTouchScreen = navigator.msMaxTouchPoints > 0;
    }
    else {
        // Same case as for Navigator - TypeScript thinks that matchMedia is obligatory property of window although it may not be
        var mQ = (_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, '(pointer:coarse)');
        if (mQ && mQ.media === '(pointer:coarse)') {
            hasTouchScreen = !!mQ.matches;
        }
        else if ('orientation' in window) {
            hasTouchScreen = true; // deprecated, but good fallback
        }
        else {
            // Only as a last resort, fall back to user agent sniffing
            var UA = navigator.userAgent;
            hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
        }
    }
    return hasTouchScreen;
};
exports.default = canUseTouchScreen;
