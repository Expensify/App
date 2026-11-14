import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {CUBIC_IN_OUT} from '@libs/Animation/cssEasing';

import CONST from '@src/CONST';

import React from 'react';
import Animated, {css, FadeIn, FadeOut} from 'react-native-reanimated';

const INDICATOR_MIDPOINT = '50%';

const FADE_IN = FadeIn.duration(CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION);
const FADE_OUT = FadeOut.duration(CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION);

const animations = css.create({
    indicator: {
        animationName: css.keyframes({
            from: {left: '0%', width: '0%', animationTimingFunction: CUBIC_IN_OUT},
            [INDICATOR_MIDPOINT]: {left: '0%', width: '100%', animationTimingFunction: CUBIC_IN_OUT},
            to: {left: '100%', width: '0%'},
        }),
        animationDuration: `${CONST.ANIMATED_PROGRESS_BAR_DURATION * 2}ms`,
        animationDelay: `${CONST.ANIMATED_PROGRESS_BAR_DELAY}ms`,
        // Apply the first keyframe during the initial delay so the bar doesn't flash at full width before the animation starts
        animationFillMode: 'backwards',
        animationIterationCount: 'infinite',
    },
    indicatorIdle: {width: '0%'},
});

function LoadingBar() {
    const styles = useThemeStyles();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();

    return (
        <Animated.View
            entering={FADE_IN}
            exiting={FADE_OUT}
            style={styles.progressBarWrapper}
        >
            <Animated.View style={[styles.progressBar, isReducedMotionEnabled ? animations.indicatorIdle : animations.indicator]} />
        </Animated.View>
    );
}

export default LoadingBar;
