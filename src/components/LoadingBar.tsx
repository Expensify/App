import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import CONST from '@src/CONST';

import React, {useState} from 'react';
import Animated, {css, cubicBezier} from 'react-native-reanimated';

type LoadingBarProps = {
    shouldShow: boolean;
};

const INDICATOR_EASING = cubicBezier(0.65, 0, 0.35, 1);
const INDICATOR_MIDPOINT = '50%';

const CONTAINER_TRANSITION = {
    transitionProperty: 'opacity',
    transitionDuration: `${CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION}ms`,
} as const;

const animations = css.create({
    indicator: {
        animationName: css.keyframes({
            from: {left: '0%', width: '0%', animationTimingFunction: INDICATOR_EASING},
            [INDICATOR_MIDPOINT]: {left: '0%', width: '100%', animationTimingFunction: INDICATOR_EASING},
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

    // The indicator keeps moving while the bar fades out, and is detached once the fade-out ends,
    // so it doesn't run while hidden and restarts from the beginning the next time the bar is shown
    const [isIndicatorAnimating, setIsIndicatorAnimating] = useState(shouldShow);
    if (shouldShow && !isIndicatorAnimating) {
        setIsIndicatorAnimating(true);
    }

    const stopIndicatorAfterFadeOut = () => {
        if (shouldShow) {
            return;
        }
        setIsIndicatorAnimating(false);
    };

    return (
        <Animated.View
            style={[styles.progressBarWrapper, shouldShow ? animations.containerVisible : animations.containerHidden]}
            onCSSTransitionEnd={stopIndicatorAfterFadeOut}
        >
            <Animated.View style={[styles.progressBar, isIndicatorAnimating && !isReducedMotionEnabled ? animations.indicator : animations.indicatorIdle]} />
        </Animated.View>
    );
}

export default LoadingBar;
