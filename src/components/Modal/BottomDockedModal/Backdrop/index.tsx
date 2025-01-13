import React from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithFeedback} from '@components/Pressable';
import useThemeStyles from '@hooks/useThemeStyles';

function Backdrop({style, hasBackdrop, customBackdrop, onBackdropPress, animationInTiming = 300, animationOutTiming = 300, animationInDelay = 100}: BackdropProps) {
    const styles = useThemeStyles();

    if (!hasBackdrop) {
        return null;
    }

    const BackdropOverlay = (
        <Animated.View
            entering={FadeIn.delay(animationInDelay).duration(animationInTiming)}
            exiting={FadeOut.duration(animationOutTiming)}
        >
            <View style={[styles.modalBackdrop, style]}>{!!customBackdrop && customBackdrop}</View>
        </Animated.View>
    );

    if (!customBackdrop) {
        return (
            <PressableWithFeedback
                accessible
                accessibilityLabel="Modal Backdrop"
                onPress={onBackdropPress}
                pressDimmingValue={1}
            >
                {BackdropOverlay}
            </PressableWithFeedback>
        );
    }

    return BackdropOverlay;
}

export default Backdrop;
