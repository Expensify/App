import React, {useEffect} from 'react';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type LoadingBarProps = {
    // Whether to show the loading bar
    shouldShow: boolean;
};

function LoadingBar({shouldShow}: LoadingBarProps) {
    const height = useSharedValue(0);
    const left = useSharedValue(-30);
    const opacity = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const styles = useThemeStyles();

    useEffect(() => {
        if (shouldShow && !isAnimating.get()) {
            isAnimating.set(true);
            opacity.set(withTiming(1, {duration: CONST.TIMING.SKELETON_FADE_DURATION}));
            height.set(2);

            left.set(
                withTiming(100, {duration: CONST.TIMING.SKELETON_SLIDE_DURATION}, () => {
                    requestAnimationFrame(() => {
                        if (shouldShow) {
                            left.set(-30);
                            left.set(withTiming(100, {duration: CONST.TIMING.SKELETON_SLIDE_DURATION}));
                        } else {
                            opacity.set(
                                withTiming(0, {duration: CONST.TIMING.SKELETON_FADE_DURATION}, () => {
                                    isAnimating.set(false);
                                }),
                            );
                        }
                    });
                }),
            );
        } else if (!shouldShow) {
            opacity.set(
                withTiming(0, {duration: CONST.TIMING.SKELETON_FADE_DURATION}, () => {
                    isAnimating.set(false);
                }),
            );
            height.set(0);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShow]);

    const progressBarWrapperStyle = useAnimatedStyle(() => ({
        height: height.get()
    }));

    const barStyle = useAnimatedStyle(() => ({
        left: `${left.get()}%`,
        width: '30%',
        height: '100%',
        backgroundColor: colors.green,
        opacity: opacity.get(),
        borderRadius: 2,
    }));

    return (
        <Animated.View style={[styles.progressBarWrapper, progressBarWrapperStyle]}>
            <Animated.View style={barStyle} />
        </Animated.View>
    );
}

LoadingBar.displayName = 'LoadingBar';

export default LoadingBar;
