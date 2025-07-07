"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HapticFeedback_1 = require("@libs/HapticFeedback");
function usePaymentAnimations() {
    var _a = (0, react_1.useState)(false), isPaidAnimationRunning = _a[0], setIsPaidAnimationRunning = _a[1];
    var _b = (0, react_1.useState)(false), isApprovedAnimationRunning = _b[0], setIsApprovedAnimationRunning = _b[1];
    var stopAnimation = (0, react_1.useCallback)(function () {
        setIsPaidAnimationRunning(false);
        setIsApprovedAnimationRunning(false);
    }, []);
    var startAnimation = (0, react_1.useCallback)(function () {
        setIsPaidAnimationRunning(true);
        HapticFeedback_1.default.longPress();
    }, []);
    var startApprovedAnimation = (0, react_1.useCallback)(function () {
        setIsApprovedAnimationRunning(true);
        HapticFeedback_1.default.longPress();
    }, []);
    return {
        isPaidAnimationRunning: isPaidAnimationRunning,
        isApprovedAnimationRunning: isApprovedAnimationRunning,
        stopAnimation: stopAnimation,
        startAnimation: startAnimation,
        startApprovedAnimation: startApprovedAnimation,
    };
}
exports.default = usePaymentAnimations;
