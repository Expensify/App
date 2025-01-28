import React from 'react';
import {View} from 'react-native';
import Animated, {Keyframe} from 'react-native-reanimated';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

const FadeIn = new Keyframe({
    from: {opacity: 0},
    to: {opacity: 0.72},
});

const FadeOut = new Keyframe({
    from: {opacity: 0.72},
    to: {opacity: 0},
});

function Backdrop({style, customBackdrop, onBackdropPress, animationInTiming = 300, animationOutTiming = 300}: BackdropProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!customBackdrop) {
        return (
            <Animated.View
                entering={FadeIn.duration(animationInTiming)}
                exiting={FadeOut.duration(animationOutTiming)}
            >
                <PressableWithoutFeedback
                    accessible
                    accessibilityLabel={translate('modal.backdropLabel')}
                    onPress={onBackdropPress}
                >
                    <View style={[styles.modalBackdrop, style]} />
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
