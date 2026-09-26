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
                // The absolute child doesn't size its parent. Native touch handling needs full-screen bounds to allow small finger movements.
                style={StyleSheet.absoluteFill}
                accessible
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('common.dismiss')}
                onPress={onBackdropPress}
                sentryLabel={CONST.SENTRY_LABEL.REANIMATED_MODAL.BACKDROP}
            >
                {BackdropOverlay}
            </PressableWithoutFeedback>
        );
    }

    return BackdropOverlay;
}

export default Backdrop;
