import React, {useEffect} from 'react';
import type {ReactNode} from 'react';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import Animated, {Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type {AnimatedProps, EasingFunction, EasingFunctionFactory} from 'react-native-reanimated';
import onAnimationFinished from './libs/onAnimationFinished';
import {usePresence} from './Presence';

type PercentString = `${number}%`;
type TranslateValue = number | PercentString;

type AnimationFrame = {
    readonly opacity: number;
    readonly translateX: TranslateValue;
    readonly translateY: TranslateValue;
};

type AnimationSpec = {
    readonly from: AnimationFrame;
    readonly to: AnimationFrame;
};

type AnimatedViewPropsPassthrough = Omit<AnimatedProps<ViewProps>, 'style' | 'children'>;

type AnimatedSurfaceProps = AnimatedViewPropsPassthrough & {
    enterSpec: AnimationSpec;
    exitSpec: AnimationSpec;
    enterTiming: number;
    exitTiming: number;
    easing?: EasingFunction | EasingFunctionFactory;
    style?: StyleProp<ViewStyle>;
    children: ReactNode;
};

function AnimatedSurface({enterSpec, exitSpec, enterTiming, exitTiming, easing, style, children, ...passthrough}: AnimatedSurfaceProps) {
    const presence = usePresence('<Overlay.AnimatedSurface>');
    const {state: presenceState} = presence.state;
    const {onAnimationEnd} = presence.actions;

    const opacity = useSharedValue<number>(enterSpec.from.opacity);
    const translateX = useSharedValue<TranslateValue>(enterSpec.from.translateX);
    const translateY = useSharedValue<TranslateValue>(enterSpec.from.translateY);

    const {opacity: enterOpacity, translateX: enterTranslateX, translateY: enterTranslateY} = enterSpec.to;
    const {opacity: exitOpacity, translateX: exitTranslateX, translateY: exitTranslateY} = exitSpec.to;

    useEffect(() => {
        const resolvedEasing = easing ?? Easing.linear;
        if (presenceState === 'mounted') {
            const options = {duration: enterTiming, easing: resolvedEasing, reduceMotion: ReduceMotion.System};
            opacity.set(withTiming(enterOpacity, options));
            translateX.set(withTiming(enterTranslateX, options));
            translateY.set(withTiming(enterTranslateY, options));
            return;
        }
        if (presenceState === 'unmountSuspended') {
            const options = {duration: exitTiming, easing: resolvedEasing, reduceMotion: ReduceMotion.System};
            opacity.set(withTiming(exitOpacity, options, onAnimationFinished(onAnimationEnd)));
            translateX.set(withTiming(exitTranslateX, options));
            translateY.set(withTiming(exitTranslateY, options));
        }
    }, [
        presenceState,
        enterOpacity,
        enterTranslateX,
        enterTranslateY,
        exitOpacity,
        exitTranslateX,
        exitTranslateY,
        enterTiming,
        exitTiming,
        easing,
        onAnimationEnd,
        opacity,
        translateX,
        translateY,
    ]);

    const animatedStyle = useAnimatedStyle(
        (): ViewStyle => ({
            opacity: opacity.get(),
            transform: [{translateX: translateX.get()}, {translateY: translateY.get()}],
        }),
    );

    if (presenceState === 'unmounted') {
        return null;
    }

    return (
        <Animated.View
            {...passthrough}
            pointerEvents="auto"
            style={[style, animatedStyle]}
        >
            {children}
        </Animated.View>
    );
}

const FADE_ONLY_ENTER_SPEC: AnimationSpec = {
    from: {opacity: 0, translateX: 0, translateY: 0},
    to: {opacity: 1, translateX: 0, translateY: 0},
};

const FADE_ONLY_EXIT_SPEC: AnimationSpec = {
    from: {opacity: 1, translateX: 0, translateY: 0},
    to: {opacity: 0, translateX: 0, translateY: 0},
};

export default AnimatedSurface;
export {FADE_ONLY_ENTER_SPEC, FADE_ONLY_EXIT_SPEC};
export type {AnimatedSurfaceProps, AnimationFrame, AnimationSpec, TranslateValue};
