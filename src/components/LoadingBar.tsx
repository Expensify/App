import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import colors from '@styles/theme/colors';

type LoadingBarProps = {shouldShow: boolean};

function LoadingBar({shouldShow}: LoadingBarProps) {
    const left = useSharedValue(-30);
    const opacity = useSharedValue(0);
    const isAnimating = useSharedValue(false);

    useEffect(() => {
        if (shouldShow && !isAnimating.value) {
            isAnimating.value = true;
            opacity.value = withTiming(1, {duration: 300});

            left.value = withTiming(100, {duration: 1200}, () => {
                requestAnimationFrame(() => {
                    if (shouldShow) {
                        left.value = -30;
                        left.value = withTiming(100, {duration: 1200});
                    } else {
                        opacity.value = withTiming(0, {duration: 300}, () => {
                            isAnimating.value = false;
                        });
                    }
                });
            });
        } else if (!shouldShow) {
            opacity.value = withTiming(0, {duration: 300}, () => {
                isAnimating.value = false;
            });
        }
    }, [shouldShow]);

    const barStyle = useAnimatedStyle(() => ({
        left: `${left.value}%`,
        width: '30%',
        height: '100%',
        backgroundColor: colors.green,
        opacity: opacity.value,
        borderRadius: 2,
    }));

    return (
        <View style={{height: 2, overflow: 'hidden'}}>
            <Animated.View style={barStyle} />
        </View>
    );
}

export default LoadingBar;
