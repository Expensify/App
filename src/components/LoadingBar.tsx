import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

type LoadingBarProps = {
    // Whether to show the loading bar
    shouldShow: boolean;
};

function LoadingBar({shouldShow}: LoadingBarProps) {
    const left = useSharedValue(-30);
    const opacity = useSharedValue(0);
    const isAnimating = useSharedValue(false);
    const styles = useThemeStyles();

    useEffect(() => {
        if (shouldShow && !isAnimating.get()) {
            isAnimating.set(true);
            opacity.set(withTiming(1, {duration: CONST.TIMING.SKELETON_FADE_DURATION}));

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
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [shouldShow]);

    const barStyle = useAnimatedStyle(() => ({
        left: `${left.get()}%`,
        width: '30%',
        height: '100%',
        backgroundColor: colors.green,
        opacity: opacity.get(),
        borderRadius: 2,
    }));

    return (
        <View style={[styles.progressBarWrapper]}>
            <Animated.View style={barStyle} />
        </View>
    );
}

LoadingBar.displayName = 'LoadingBar';

export default LoadingBar;
