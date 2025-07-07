"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var stack_1 = require("@react-navigation/stack");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var animation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/animation");
/**
 * Side modal stack screen options generator function
 * @param gestureDirection - The gesture direction of dismissing the modal
 * @returns The screen options object
 */
var useSideModalStackScreenOptions = function (gestureDirection) {
    if (gestureDirection === void 0) { gestureDirection = 'horizontal'; }
    var styles = (0, useThemeStyles_1.default)();
    var universalGestureDirection;
    var webGestureDirection;
    if (gestureDirection === 'horizontal' || gestureDirection === 'vertical') {
        universalGestureDirection = gestureDirection;
    }
    else {
        webGestureDirection = gestureDirection;
    }
    return {
        headerShown: false,
        animation: animation_1.default.SLIDE_FROM_RIGHT,
        gestureDirection: universalGestureDirection,
        web: __assign({ cardStyle: styles.navigationScreenCardStyle, cardStyleInterpolator: stack_1.CardStyleInterpolators.forHorizontalIOS }, (webGestureDirection && { gestureDirection: webGestureDirection })),
    };
};
exports.default = useSideModalStackScreenOptions;
