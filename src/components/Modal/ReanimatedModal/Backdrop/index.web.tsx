import type {BackdropProps} from '@components/Modal/ReanimatedModal/types';
import {cssEasing, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ViewStyle} from 'react-native';
import type {CSSStyle} from 'react-native-reanimated';

import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {Keyframe, ReduceMotion} from 'react-native-reanimated';

function Backdrop({
    style,
    customBackdrop,
    onBackdropPress,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
    isBackdropVisible,
    backdropOpacity = variables.overlayOpacity,
}: BackdropProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    let Exiting;
    if (!backdropOpacity) {
        Exiting = undefined;
    } else {
        const FadeOut = new Keyframe(getModalOutAnimation('fadeOut', backdropOpacity));
        Exiting = FadeOut.duration(animationOutTiming).reduceMotion(ReduceMotion.Never);
    }

    // The backdrop fills the modal's fixed root rather than taking the window's size. On mobile Safari the window is the visual
    // viewport, which ends above the keyboard, while the root spans the page down to the keyboard: a window-sized backdrop would
    // leave the page showing, undimmed, between a bottom sheet and the keyboard. The pressable wrapper has to fill the root as well,
    // since the dimming view is positioned against it and a wrapper of no size would give the backdrop no area to press.
    // A CSS animation instead of an entering keyframe: on web, Reanimated hides an entering element until its keyframe starts and can
    // delete the keyframe before the next animation frame (for example in a background tab), which leaves the backdrop hidden for good.
    // A CSS animation keeps its keyframes until the view unmounts and never hides the view.
    const backdropStyle: CSSStyle<ViewStyle> = {
        opacity: backdropOpacity,
        animationName: {from: {opacity: 0}, to: {opacity: backdropOpacity}},
        animationDuration: animationInTiming,
        animationTimingFunction: cssEasing,
    };

    if (!customBackdrop) {
        return (
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPress={onBackdropPress}
                style={[StyleSheet.absoluteFill, styles.userSelectNone, styles.cursorAuto]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                sentryLabel={CONST.SENTRY_LABEL.REANIMATED_MODAL.BACKDROP}
            >
                {isBackdropVisible && (
                    <Animated.View
                        style={[styles.modalBackdrop, backdropStyle, style]}
                        exiting={Exiting}
                    />
                )}
            </PressableWithoutFeedback>
        );
    }
    return (
        isBackdropVisible && (
            <View
                style={[StyleSheet.absoluteFill, styles.userSelectNone]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <Animated.View
                    exiting={Exiting}
                    style={[styles.modalBackdrop, backdropStyle, style]}
                >
                    {!!customBackdrop && customBackdrop}
                </Animated.View>
            </View>
        )
    );
}

export default Backdrop;
