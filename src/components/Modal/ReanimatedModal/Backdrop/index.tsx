import type {BackdropProps} from '@components/Modal/ReanimatedModal/types';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React from 'react';
import {StyleSheet} from 'react-native';
import Animated, {Keyframe} from 'react-native-reanimated';

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

    // The fade ends at the backdrop's own opacity, as the keyframe overrides the opacity of the style while it runs.
    const Entering = new Keyframe(getModalInAnimation('fadeIn', backdropOpacity)).duration(animationInTiming);
    const Exiting = new Keyframe(getModalOutAnimation('fadeOut', backdropOpacity)).duration(animationOutTiming);

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
                // iOS skips a view with no opacity when it looks for the view under a touch, so the pressable spans the
                // screen itself and a backdrop that does not dim the screen still takes the tap.
                style={StyleSheet.absoluteFill}
                sentryLabel={CONST.SENTRY_LABEL.REANIMATED_MODAL.BACKDROP}
            >
                {BackdropOverlay}
            </PressableWithoutFeedback>
        );
    }

    return BackdropOverlay;
}

export default Backdrop;
