import React, {useEffect} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Animated, {cancelAnimation, Easing, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming} from 'react-native-reanimated';
import type {AnimatedStyle, SharedValue} from 'react-native-reanimated';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';
import CONST from '@src/CONST';

const {FADE_OUT_DURATION, FADE_IN_DURATION, PAUSE_DURATION, RECOVERY_DURATION} = CONST.PULSE_ANIMATION;

const EASING_OUT = Easing.out(Easing.quad);
const EASING_IN = Easing.in(Easing.quad);

type PulsingViewProps = {
    /** Whether the view should pulse */
    shouldPulse: boolean;

    /** Content to render */
    children: React.ReactNode;

    /**
     * Array of style objects
     * @default []
     */
    style?: StyleProp<AnimatedStyle<ViewStyle>>;

    /**
     * The minimum opacity reached during the pulse
     * @default 0.5
     */
    minOpacity?: number;

    /** Whether the view needs to be rendered offscreen (for Android only) */
    needsOffscreenAlphaCompositing?: boolean;

    /** Style applied to a non-animated outer wrapper, useful for opaque backgrounds that shouldn't pulse */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function startPulse(opacity: SharedValue<number>, minOpacity: number) {
    'worklet';

    opacity.set(
        withRepeat(
            withSequence(
                withTiming(minOpacity, {duration: FADE_OUT_DURATION, easing: EASING_OUT}),
                withTiming(1, {duration: FADE_IN_DURATION, easing: EASING_IN}),
                withDelay(PAUSE_DURATION, withTiming(1, {duration: 0})),
            ),
            -1,
            false,
        ),
    );
}

function stopPulse(opacity: SharedValue<number>) {
    'worklet';

    cancelAnimation(opacity);
    opacity.set(withTiming(1, {duration: RECOVERY_DURATION, easing: EASING_OUT}));
}

function PulsingView({shouldPulse, children, style = [], minOpacity = 0.5, needsOffscreenAlphaCompositing = false, wrapperStyle}: PulsingViewProps) {
    const shouldPulseShared = useSharedValue(shouldPulse);
    useEffect(() => {
        shouldPulseShared.set(shouldPulse);
    }, [shouldPulse, shouldPulseShared]);

    const minOpacityShared = useSharedValue(minOpacity);
    useEffect(() => {
        minOpacityShared.set(minOpacity);
    }, [minOpacity, minOpacityShared]);

    const opacity = useSharedValue(1);

    useAnimatedReaction(
        () => shouldPulseShared.get(),
        (isPulsing, wasPulsing) => {
            if (isPulsing === wasPulsing) {
                return;
            }

            if (isPulsing) {
                startPulse(opacity, minOpacityShared.get());
            } else {
                stopPulse(opacity);
            }
        },
    );

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
    }));

    const animatedContent = (
        <Animated.View
            style={[animatedStyle, style]}
            needsOffscreenAlphaCompositing={shouldRenderOffscreen ? needsOffscreenAlphaCompositing : undefined}
        >
            {children}
        </Animated.View>
    );

    if (wrapperStyle) {
        return <View style={wrapperStyle}>{animatedContent}</View>;
    }

    return animatedContent;
}

export default PulsingView;
