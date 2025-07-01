import {Easing} from 'react-native-reanimated';
import type {ValidKeyframeProps} from 'react-native-reanimated/lib/typescript/commonTypes';
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
                    opacity: 0.72,
                    easing,
                },
            };
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
                from: {opacity: 0.72},
                to: {
                    opacity: 0,
                    easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}

export {getModalInAnimation, getModalOutAnimation};
