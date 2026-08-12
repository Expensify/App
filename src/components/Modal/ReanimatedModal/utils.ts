import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ViewStyle} from 'react-native';
import type {ValidKeyframeProps} from 'react-native-reanimated/lib/typescript/commonTypes';

import {Easing} from 'react-native-reanimated';

import type {AnimationIn, AnimationOut} from './types';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function getModalInAnimation(animationType: AnimationIn): ValidKeyframeProps {
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
        case 'slideAndFadeInRight':
            return {
                from: {opacity: 0, transform: [{translateX: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}]},
                to: {
                    opacity: 1,
                    transform: [{translateX: 0}],
                    easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}

/**
 * @returns A function that takes a number between 0 and 1 and returns a ViewStyle object.
 */
function getModalInAnimationStyle(animationType: AnimationIn): (progress: number) => ViewStyle {
    switch (animationType) {
        case 'slideInRight':
            return (progress) => ({transform: [{translateX: `${100 * (1 - progress)}%`}]});
        case 'slideInUp':
            return (progress) => ({transform: [{translateY: `${100 * (1 - progress)}%`}]});
        case 'fadeIn':
            return (progress) => ({opacity: progress});
        case 'slideAndFadeInRight':
            return (progress) => ({opacity: progress, transform: [{translateX: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB * (1 - progress)}]});
        default:
            throw new Error('Unknown animation type');
    }
}

function getModalOutAnimation(animationType: AnimationOut): ValidKeyframeProps {
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
        case 'slideAndFadeOutRight':
            return {
                from: {opacity: 1, transform: [{translateX: 0}]},
                to: {
                    opacity: 0,
                    transform: [{translateX: CONST.MODAL.RHP_ENTER_OFFSET_PX_WEB}],
                    easing,
                },
            };
        default:
            throw new Error('Unknown animation type');
    }
}

export {getModalInAnimation, getModalOutAnimation, getModalInAnimationStyle, easing};
