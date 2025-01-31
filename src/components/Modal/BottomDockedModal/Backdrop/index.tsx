import React, {useMemo} from 'react';
import Animated from 'react-native-reanimated';
import {FadeIn, FadeOut} from '@components/Modal/BottomDockedModal/animations';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithoutFeedback} from '@components/Pressable';
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
                style={[styles.modalBackdrop, style]}
            >
                {!!customBackdrop && customBackdrop}
            </Animated.View>
        ),
        [animationInDelay, animationInTiming, animationOutTiming, customBackdrop, style, styles.modalBackdrop],
    );

    if (!customBackdrop) {
        return (
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPressIn={onBackdropPress}
            >
                {BackdropOverlay}
            </PressableWithoutFeedback>
        );
    }

    return BackdropOverlay;
}

export default Backdrop;
