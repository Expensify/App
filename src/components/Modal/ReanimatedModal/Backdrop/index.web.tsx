import type {BackdropProps} from '@components/Modal/ReanimatedModal/types';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useMemo} from 'react';
import {View} from 'react-native';
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

    const Entering = useMemo(() => {
        if (!backdropOpacity) {
            return;
        }
        const FadeIn = new Keyframe(getModalInAnimation('fadeIn'));
        return FadeIn.duration(animationInTiming).reduceMotion(ReduceMotion.Never);
    }, [animationInTiming, backdropOpacity]);

    const Exiting = useMemo(() => {
        if (!backdropOpacity) {
            return;
        }
        const FadeOut = new Keyframe(getModalOutAnimation('fadeOut'));
        return FadeOut.duration(animationOutTiming).reduceMotion(ReduceMotion.Never);
    }, [animationOutTiming, backdropOpacity]);

    const backdropStyle = useMemo(
        () => ({
            opacity: backdropOpacity,
        }),
        [backdropOpacity],
    );

    if (!customBackdrop) {
        return (
            // Keep the interactive wrapper full-screen so Safari does not size the overlay from its narrower reported window dimensions.
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPress={onBackdropPress}
                style={[styles.fullScreen, styles.userSelectNone, styles.cursorAuto]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                sentryLabel={CONST.SENTRY_LABEL.REANIMATED_MODAL.BACKDROP}
            >
                {isBackdropVisible && (
                    <Animated.View
                        style={[styles.flex1, backdropStyle, style]}
                        entering={Entering}
                        exiting={Exiting}
                    />
                )}
            </PressableWithoutFeedback>
        );
    }
    return (
        isBackdropVisible && (
            <View
                style={[styles.fullScreen, styles.userSelectNone]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            >
                <Animated.View
                    entering={Entering}
                    exiting={Exiting}
                    style={[styles.flex1, backdropStyle, style]}
                >
                    {!!customBackdrop && customBackdrop}
                </Animated.View>
            </View>
        )
    );
}

export default Backdrop;
