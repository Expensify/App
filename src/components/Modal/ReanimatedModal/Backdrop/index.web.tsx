import type {BackdropProps} from '@components/Modal/ReanimatedModal/types';
import {easing, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import {PressableWithoutFeedback} from '@components/Pressable';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import Animated, {Keyframe, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

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

    const progress = useSharedValue(0);

    useEffect(() => {
        if (!isBackdropVisible) {
            return;
        }
        progress.set(0);
        progress.set(withTiming(1, {duration: animationInTiming, easing, reduceMotion: ReduceMotion.Never}));
    }, [animationInTiming, isBackdropVisible, progress]);

    const Exiting = useMemo(() => {
        if (!backdropOpacity) {
            return;
        }
        const FadeOut = new Keyframe(getModalOutAnimation('fadeOut', backdropOpacity));
        return FadeOut.duration(animationOutTiming).reduceMotion(ReduceMotion.Never);
    }, [animationOutTiming, backdropOpacity]);

    // Instead of an entering keyframe: on web, Reanimated hides the element until the keyframe starts and can delete the keyframe
    // before the next animation frame (for example in a background tab), which leaves the backdrop hidden for good
    const backdropStyle = useAnimatedStyle(() => ({opacity: progress.get() * backdropOpacity}));

    if (!customBackdrop) {
        return (
            <PressableWithoutFeedback
                accessible
                accessibilityLabel={translate('modal.backdropLabel')}
                onPress={onBackdropPress}
                style={[styles.userSelectNone, styles.cursorAuto]}
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
                style={[styles.userSelectNone]}
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
