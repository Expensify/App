import type {ViewStyle} from 'react-native';
import {Easing} from 'react-native-reanimated';
import type {ValidKeyframeProps} from 'react-native-reanimated/lib/typescript/commonTypes';
import variables from '@styles/variables';
import type {AnimationInType, AnimationOutType} from './types';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function getModalInAnimation(animationType: AnimationInType): ValidKeyframeProps {
    switch (animationType) {
        case 'slideInRight':
            return {
                from: {transform: [{translateX: '100%'}]},
                to: {
                    transform: [{translateX: '0%'}],
                    easing,
                },
            };
        case 'slideInUp':
            return {
                from: {transform: [{translateY: '100%'}]},
                to: {
                    transform: [{translateY: '0%'}],
                    easing,
                },
            };
        case 'fadeIn':
            return {
                from: {opacity: 0},
                to: {
                    opacity: variables.overlayOpacity,
                    easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}

function getModalInAnimationStyle(animationType: AnimationInType): (progress: number) => ViewStyle {
    // 'progress' in range [0, 1]
    switch (animationType) {
        case 'slideInRight':
            return (progress) => ({transform: [{translateX: `${100 * (1 - progress)}%`}]});
        case 'slideInUp':
            return (progress) => ({transform: [{translateY: `${100 * (1 - progress)}%`}]});
        case 'fadeIn':
            return (progress) => ({opacity: progress});
        default:
            throw new Error('Unknown animation type');
    }
}

function getModalOutAnimation(animationType: AnimationOutType): ValidKeyframeProps {
    switch (animationType) {
        case 'slideOutRight':
            return {
                from: {transform: [{translateX: '0%'}]},
                to: {
                    transform: [{translateX: '100%'}],
                    easing,
                },
            };
        case 'slideOutDown':
            return {
                from: {transform: [{translateY: '0%'}]},
                to: {
                    transform: [{translateY: '100%'}],
                    easing,
                },
            };
        case 'fadeOut':
            return {
                from: {opacity: variables.overlayOpacity},
                to: {
                    opacity: 0,
                    easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}

export {getModalInAnimation, getModalOutAnimation, getModalInAnimationStyle};
