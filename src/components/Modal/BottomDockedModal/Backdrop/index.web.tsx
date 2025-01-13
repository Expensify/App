import React from 'react';
import {View} from 'react-native';
import Animated, {Easing, FadeIn, Keyframe} from 'react-native-reanimated';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithoutFeedback} from '@components/Pressable';
import useThemeStyles from '@hooks/useThemeStyles';

/* eslint-disable @typescript-eslint/naming-convention */
const FadeOut = new Keyframe({
    0: {opacity: 1},
    100: {opacity: 0, easing: Easing.out(Easing.ease)},
});

function Backdrop({style, customBackdrop, onBackdropPress, animationInTiming = 300, animationOutTiming = 300}: BackdropProps) {
    const styles = useThemeStyles();

    if (!customBackdrop) {
        return (
            <Animated.View
                entering={FadeIn.duration(animationInTiming)}
                exiting={FadeOut.duration(animationOutTiming)}
            >
                <PressableWithoutFeedback
                    accessible
                    accessibilityLabel="Modal Backdrop"
                    onPress={onBackdropPress}
                >
                    <View style={[styles.modalBackdrop, style]}>{!!customBackdrop && customBackdrop}</View>
                </PressableWithoutFeedback>
            </Animated.View>
        );
    }

    return (
        <Animated.View
            entering={FadeIn.duration(animationInTiming)}
            exiting={FadeOut.duration(animationOutTiming)}
        >
            <View style={[styles.modalBackdrop, style]}>{!!customBackdrop && customBackdrop}</View>
        </Animated.View>
    );
}

export default Backdrop;
