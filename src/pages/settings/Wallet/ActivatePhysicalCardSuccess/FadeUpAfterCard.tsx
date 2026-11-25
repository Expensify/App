/**
 * Holds back the success screen's text until the spinning card has settled, then fades it in while it rises into place.
 * With reduced motion turned on, the text is shown straight away.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import type {ReactNode} from 'react';

import React, {useEffect} from 'react';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';

import {CARD_SETTLE_MS} from './SpinningCard';

/** How far below its resting place the text starts, in px */
const START_OFFSET_PX = 12;
const DURATION_MS = 450;

type FadeUpAfterCardProps = {
    /** Text revealed once the card has settled */
    children: ReactNode;
};

function FadeUpAfterCard({children}: FadeUpAfterCardProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const opacity = useSharedValue(isReduceMotionEnabled ? 1 : 0);
    const translateY = useSharedValue(isReduceMotionEnabled ? 0 : START_OFFSET_PX);

    useEffect(() => {
        if (isReduceMotionEnabled) {
            return;
        }
        const easing = Easing.out(Easing.cubic);
        opacity.set(withDelay(CARD_SETTLE_MS, withTiming(1, {duration: DURATION_MS, easing})));
        translateY.set(withDelay(CARD_SETTLE_MS, withTiming(0, {duration: DURATION_MS, easing})));
    }, [isReduceMotionEnabled, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.get(),
        transform: [{translateY: translateY.get()}],
    }));

    return <Animated.View style={[styles.w100, styles.alignItemsCenter, animatedStyle]}>{children}</Animated.View>;
}

export default FadeUpAfterCard;
