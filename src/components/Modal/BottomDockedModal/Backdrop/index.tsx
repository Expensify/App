import React, {useMemo} from 'react';
import Animated, {Keyframe} from 'react-native-reanimated';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithFeedback} from '@components/Pressable';
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
