import Accessibility from '@libs/Accessibility';
import {QUAD_IN, QUAD_OUT} from '@libs/Animation/cssEasing';
import shouldRenderOffscreen from '@libs/shouldRenderOffscreen';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';
import type {CSSStyle} from 'react-native-reanimated';

import React from 'react';
import {View} from 'react-native';
import Animated, {css} from 'react-native-reanimated';

const {FADE_OUT_DURATION, FADE_IN_DURATION, PAUSE_DURATION} = CONST.PULSE_ANIMATION;

const PULSE_DURATION = FADE_OUT_DURATION + FADE_IN_DURATION + PAUSE_DURATION;
const FADE_OUT_END = `${(FADE_OUT_DURATION / PULSE_DURATION) * 100}%`;
const FADE_IN_END = `${((FADE_OUT_DURATION + FADE_IN_DURATION) / PULSE_DURATION) * 100}%`;

type PulsingViewProps = {
    shouldPulse: boolean;
    children: React.ReactNode;

    /**
     * Array of style objects
     * @default []
     */
    style?: StyleProp<ViewStyle>;

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

// Keyframes depend on minOpacity only, so they are created once per distinct value instead of on every render
const pulseStyles = new Map<number, CSSStyle<ViewStyle>>();

function getPulseStyle(minOpacity: number): CSSStyle<ViewStyle> {
    const cachedStyle = pulseStyles.get(minOpacity);
    if (cachedStyle) {
        return cachedStyle;
    }

    const pulseStyle: CSSStyle<ViewStyle> = {
        animationName: css.keyframes({
            from: {opacity: 1, animationTimingFunction: QUAD_OUT},
            [FADE_OUT_END]: {opacity: minOpacity, animationTimingFunction: QUAD_IN},
            [FADE_IN_END]: {opacity: 1},
            to: {opacity: 1},
        }),
        animationDuration: `${PULSE_DURATION}ms`,
        animationIterationCount: 'infinite',
    };
    pulseStyles.set(minOpacity, pulseStyle);
    return pulseStyle;
}

function PulsingView({shouldPulse, children, style = [], minOpacity = 0.5, needsOffscreenAlphaCompositing = false, wrapperStyle}: PulsingViewProps) {
    const isReducedMotionEnabled = Accessibility.useReducedMotion();

    const animatedContent = (
        <Animated.View
            style={[shouldPulse && !isReducedMotionEnabled && getPulseStyle(minOpacity), style]}
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
