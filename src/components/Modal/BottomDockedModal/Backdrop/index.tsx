import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated, {FadeIn, FadeOut} from 'react-native-reanimated';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function Backdrop({style, customBackdrop, onBackdropPress, animationInTiming = 300, animationOutTiming = 300, animationInDelay = 100}: BackdropProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const BackdropOverlay = useMemo(
        () => (
            <Animated.View
                entering={FadeIn.delay(animationInDelay).duration(animationInTiming)}
                exiting={FadeOut.duration(animationOutTiming)}
            >
                <View style={[styles.modalBackdrop, style]}>{!!customBackdrop && customBackdrop}</View>
            </Animated.View>
        ),
        [animationInDelay, animationInTiming, animationOutTiming, customBackdrop, style, styles.modalBackdrop],
    );

    if (!customBackdrop) {
        return (
            <PressableWithFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
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
