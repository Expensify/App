import React from 'react';
import Animated, {Keyframe, ReduceMotion} from 'react-native-reanimated';
import type {BackdropProps} from '@components/Modal/ReanimatedModal/types';
import useAnimationTransition from '@components/Modal/ReanimatedModal/useAnimationTransition';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function Backdrop({
    style,
    customBackdrop,
    onBackdropPress,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
    backdropOpacity = variables.overlayOpacity,
}: BackdropProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onAnimationComplete} = useAnimationTransition();

    const Entering = new Keyframe(getModalInAnimation('fadeIn'))
        .duration(animationInTiming)
        // ReduceMotion.Never ensures the callback fires even when system motion is reduced
        .reduceMotion(ReduceMotion.Never)
        .withCallback(onAnimationComplete);
    const Exiting = new Keyframe(getModalOutAnimation('fadeOut')).duration(animationOutTiming).reduceMotion(ReduceMotion.Never).withCallback(onAnimationComplete);

    const BackdropOverlay = (
        <Animated.View
            entering={Entering}
            exiting={Exiting}
            style={[styles.modalBackdrop, {opacity: backdropOpacity}, style]}
        >
            {!!customBackdrop && customBackdrop}
        </Animated.View>
    );

    if (!customBackdrop) {
        return (
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPressIn={onBackdropPress}
                sentryLabel={CONST.SENTRY_LABEL.REANIMATED_MODAL.BACKDROP}
            >
                {BackdropOverlay}
            </PressableWithoutFeedback>
        );
    }

    return BackdropOverlay;
}

export default Backdrop;
