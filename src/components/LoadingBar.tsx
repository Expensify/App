import React, {useEffect} from 'react';
import Animated, {cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type LoadingBarProps = {
    // Whether or not to show the loading bar
    shouldShow: boolean;
};

function LoadingBar({shouldShow}: LoadingBarProps) {
    const left = useSharedValue(0);
    const width = useSharedValue(0);
    const opacity = useSharedValue(0);
    const styles = useThemeStyles();

    useEffect(() => {
        if (shouldShow) {
            // eslint-disable-next-line react-compiler/react-compiler
            left.value = 0;
            width.value = 0;
            opacity.value = withTiming(1, {duration: CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION});

            left.value = withDelay(
                CONST.ANIMATED_PROGRESS_BAR_DELAY,
                withRepeat(
                    withSequence(
                        withTiming(0, {duration: 0}),
                        withTiming(0, {duration: CONST.ANIMATED_PROGRESS_BAR_DURATION, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                        withTiming(100, {duration: CONST.ANIMATED_PROGRESS_BAR_DURATION, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                    ),
                    -1,
                    false,
                ),
            );

            width.value = withDelay(
                CONST.ANIMATED_PROGRESS_BAR_DELAY,
                withRepeat(
                    withSequence(
                        withTiming(0, {duration: 0}),
                        withTiming(100, {duration: CONST.ANIMATED_PROGRESS_BAR_DURATION, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                        withTiming(0, {duration: CONST.ANIMATED_PROGRESS_BAR_DURATION, easing: Easing.bezier(0.65, 0, 0.35, 1)}),
                    ),
                    -1,
                    false,
                ),
            );
        } else {
            opacity.value = withTiming(0, {duration: CONST.ANIMATED_PROGRESS_BAR_OPACITY_DURATION}, () => {
                cancelAnimation(left);
                cancelAnimation(width);
            });
        }
        // we want to update only when shouldShow changes
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShow]);

    const animatedIndicatorStyle = useAnimatedStyle(() => ({
        left: `${left.value}%`,
        width: `${width.value}%`,
    }));

    const animatedContainerStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.progressBarWrapper, animatedContainerStyle]}>
            {opacity.value > 0 ? <Animated.View style={[styles.progressBar, animatedIndicatorStyle]} /> : null}
        </Animated.View>
    );
}

LoadingBar.displayName = 'ProgressBar';

export default LoadingBar;
