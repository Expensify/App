import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {CUBIC_IN_OUT} from '@libs/Animation/cssEasing';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import Animated, {css} from 'react-native-reanimated';

type LoadingBarProps = {
    shouldShow: boolean;
};

const INDICATOR_MIDPOINT = '50%';

const CONTAINER_TRANSITION = {
    transitionProperty: 'opacity',
    transitionDuration: `${CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION}ms`,
} as const;

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
    containerVisible: {opacity: 1, ...CONTAINER_TRANSITION},
    containerHidden: {opacity: 0, ...CONTAINER_TRANSITION},
});

function LoadingBar({shouldShow}: LoadingBarProps) {
    const styles = useThemeStyles();
    const isReducedMotionEnabled = Accessibility.useReducedMotion();

    // The indicator keeps moving while the bar fades out, and is detached once the fade-out ends so it doesn't run while hidden.
    // Each show gets a new key, so the indicator restarts from the beginning even when the bar is shown again mid fade-out.
    const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(shouldShow);
    const [indicatorKey, setIndicatorKey] = useState(0);
    const [prevShouldShow, setPrevShouldShow] = useState(shouldShow);
    if (shouldShow !== prevShouldShow) {
        setPrevShouldShow(shouldShow);
        if (shouldShow) {
            setIsIndicatorAnimating(true);
            setIndicatorKey((key) => key + 1);
        }
    }

    // A timer is used instead of onCSSTransitionEnd, because on web no transition end event fires when the bar is hidden,
    // shown and hidden again before the browser recalculates styles, which would leave the indicator running while hidden
    useEffect(() => {
        if (shouldShow) {
            return;
        }
        const timeout = setTimeout(() => setIsIndicatorAnimating(false), CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION);
        return () => clearTimeout(timeout);
    }, [shouldShow]);

    return (
        <Animated.View style={[styles.progressBarWrapper, shouldShow ? animations.containerVisible : animations.containerHidden]}>
            <Animated.View
                key={indicatorKey}
                style={[styles.progressBar, isIndicatorAnimating && !isReducedMotionEnabled ? animations.indicator : animations.indicatorIdle]}
            />
        </Animated.View>
    );
}

export default LoadingBar;
