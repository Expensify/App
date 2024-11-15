import type {ReactNode} from 'react';
import React from 'react';
import ReAnimated, {FadeIn, FadeOut} from 'react-native-reanimated';
import {PressableWithFeedback} from '@components/Pressable';
import styles from './modal.style';

type BackdropProps = {
    getDeviceWidth: () => number;
    getDeviceHeight: () => number;
    backdropColor: string;
    hasBackdrop: boolean;
    customBackdrop?: ReactNode;
    backdropOpacity: number;
    onBackdropPress?: () => void;
};

function Backdrop({getDeviceWidth, backdropColor, getDeviceHeight, hasBackdrop, customBackdrop, backdropOpacity, onBackdropPress, ...props}: BackdropProps) {
    if (!hasBackdrop) {
        return null;
    }

    const hasCustomBackdrop = !!customBackdrop;

    const backdropComputedStyle = [
        {
            width: getDeviceWidth(),
            height: getDeviceHeight(),
            backgroundColor: backdropColor,
            opacity: backdropOpacity,
        },
    ];

    const BDComponent = (
        <ReAnimated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
        >
            <ReAnimated.View
                style={[styles.backdrop, backdropComputedStyle]}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                {hasCustomBackdrop && customBackdrop}
            </ReAnimated.View>
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
