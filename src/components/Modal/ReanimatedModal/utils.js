"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModalInAnimation = getModalInAnimation;
exports.getModalOutAnimation = getModalOutAnimation;
var react_native_reanimated_1 = require("react-native-reanimated");
var easing = react_native_reanimated_1.Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();
function getModalInAnimation(animationType) {
    switch (animationType) {
        case 'slideInRight':
            return {
                from: { transform: [{ translateX: '100%' }] },
                to: {
                    transform: [{ translateX: '0%' }],
                    easing: easing,
                },
            };
        case 'slideInUp':
            return {
                from: { transform: [{ translateY: '100%' }] },
                to: {
                    transform: [{ translateY: '0%' }],
                    easing: easing,
                },
            };
        case 'fadeIn':
            return {
                from: { opacity: 0 },
                to: {
                    opacity: 0.72,
                    easing: easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}
function getModalOutAnimation(animationType) {
    switch (animationType) {
        case 'slideOutRight':
            return {
                from: { transform: [{ translateX: '0%' }] },
                to: {
                    transform: [{ translateX: '100%' }],
                    easing: easing,
                },
            };
        case 'slideOutDown':
            return {
                from: { transform: [{ translateY: '0%' }] },
                to: {
                    transform: [{ translateY: '100%' }],
                    easing: easing,
                },
            };
        case 'fadeOut':
            return {
                from: { opacity: 0.72 },
                to: {
                    opacity: 0,
                    easing: easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}
