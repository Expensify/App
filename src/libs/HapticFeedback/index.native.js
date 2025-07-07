"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_haptic_feedback_1 = require("react-native-haptic-feedback");
var hapticFeedback = {
    press: function () {
        react_native_haptic_feedback_1.default.trigger('impactLight', {
            enableVibrateFallback: true,
        });
    },
    longPress: function () {
        react_native_haptic_feedback_1.default.trigger('impactHeavy', {
            enableVibrateFallback: true,
        });
    },
    success: function () {
        react_native_haptic_feedback_1.default.trigger('notificationSuccess', {
            enableVibrateFallback: true,
        });
    },
    error: function () {
        react_native_haptic_feedback_1.default.trigger('notificationError', {
            enableVibrateFallback: true,
        });
    },
};
exports.default = hapticFeedback;
