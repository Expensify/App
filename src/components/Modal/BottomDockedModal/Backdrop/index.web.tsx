import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import {FadeIn, FadeOut} from '@components/Modal/BottomDockedModal/animations';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function Backdrop({style, customBackdrop, onBackdropPress, animationInTiming = 300, animationOutTiming = 300}: BackdropProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    if (!customBackdrop) {
        return (
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPress={onBackdropPress}
            >
                <Animated.View
                    style={[styles.modalBackdrop, style]}
                    entering={FadeIn.duration(animationInTiming)}
                    exiting={FadeOut.duration(animationOutTiming)}
                />
            </PressableWithoutFeedback>
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
