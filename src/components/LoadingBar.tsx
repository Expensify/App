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
        if (shouldShow && !isAnimating.get()) {
            isAnimating.set(true);
            opacity.set(withTiming(1, {duration: 300}));

            left.set(withTiming(100, {duration: 1200}, () => {
                requestAnimationFrame(() => {
                    if (shouldShow) {
                        left.set(-30);
                        left.set(withTiming(100, {duration: 1200}));
                    } else {
                        opacity.set(withTiming(0, {duration: 300}, () => {
                            isAnimating.set(false);
                        }));
                    }
                });
            }));
        } else if (!shouldShow) {
            opacity.set(withTiming(0, {duration: 300}, () => {
                isAnimating.set(false);
            }));
        }
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
        <View style={{height: 2, overflow: 'hidden'}}>
            <Animated.View style={barStyle} />
        </View>
    );
}

export default LoadingBar;
