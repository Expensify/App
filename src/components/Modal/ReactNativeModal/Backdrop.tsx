import type {ReactNode} from 'react';
import React, {useEffect} from 'react';
import ReAnimated, {Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withTiming} from 'react-native-reanimated';
import {PressableWithFeedback} from '@components/Pressable';
import styles from './modal.style';

type BackdropProps = {
    getDeviceWidth: () => number;
    getDeviceHeight: () => number;
    backdropColor: string;
    hasBackdrop: boolean;
    customBackdrop?: ReactNode;
    isVisible: boolean;
    isTransitioning: boolean;
    backdropOpacity: number;
    onBackdropPress: () => void;
};

function Backdrop({getDeviceWidth, backdropColor, getDeviceHeight, hasBackdrop, customBackdrop, isVisible, isTransitioning, backdropOpacity, onBackdropPress, ...props}: BackdropProps) {
    const opacityValue = useSharedValue(0);

    useEffect(() => {
        if (!isTransitioning) {
            return;
        }
        opacityValue.value = withDelay(0, withTiming(isVisible ? backdropOpacity : 0, {duration: 300, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.Never}));
    }, [isVisible, isTransitioning, backdropOpacity, opacityValue]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityValue.value,
        };
    });

    if (!hasBackdrop) {
        return null;
    }

    const hasCustomBackdrop = !!customBackdrop;

    const backdropComputedStyle = [
        {
            width: getDeviceWidth(),
            height: getDeviceHeight(),
            backgroundColor: backdropColor,
        },
    ];

    const BDComponent = (
        <ReAnimated.View
            style={[styles.backdrop, backdropComputedStyle, animatedStyle]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {hasCustomBackdrop && customBackdrop}
        </ReAnimated.View>
    );

    if (!hasCustomBackdrop) {
        return (
            <PressableWithFeedback
                accessible
                accessibilityLabel="test"
                onPress={onBackdropPress}
                pressDimmingValue={1}
            >
                {BDComponent}
            </PressableWithFeedback>
        );
    }

    return BDComponent;
}

export default Backdrop;
