/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import {Easing, Keyframe} from 'react-native-reanimated';
import type {ReanimatedKeyframe} from 'react-native-reanimated/lib/typescript/layoutReanimation/animationBuilder/Keyframe';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

const SlideIn = new Keyframe({
    from: {transform: [{translateY: '100%'}]},
    to: {
        transform: [{translateY: '0%'}],
        // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
        easing,
    },
    // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
}).build() as ReanimatedKeyframe;

const SlideOut = new Keyframe({
    from: {transform: [{translateY: '0%'}]},
    to: {
        transform: [{translateY: '100%'}],
        // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
        easing,
    },
    // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
}).build() as ReanimatedKeyframe;

const FadeIn = new Keyframe({
    from: {opacity: 0},
    to: {
        opacity: 0.72,
        // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
        easing,
    },
    // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
}).build() as ReanimatedKeyframe;

const FadeOut = new Keyframe({
    from: {opacity: 0.72},
    to: {
        opacity: 0,
        // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
        easing,
    },
    // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
}).build() as ReanimatedKeyframe;

const ContainerFadeOut = new Keyframe({
    from: {opacity: 1},
    to: {
        opacity: 0,
        // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
        easing,
    },
    // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
}).build() as ReanimatedKeyframe;

export {SlideIn, SlideOut, FadeIn, FadeOut, ContainerFadeOut};
