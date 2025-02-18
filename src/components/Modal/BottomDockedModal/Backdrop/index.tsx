import React, {useMemo} from 'react';
import Animated, {Easing, Keyframe} from 'react-native-reanimated';
import type {ReanimatedKeyframe} from 'react-native-reanimated/lib/typescript/layoutReanimation/animationBuilder/Keyframe';
import type {BackdropProps} from '@components/Modal/BottomDockedModal/types';
import {PressableWithoutFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0);

/**
 * Due to issues with react-native-reanimated Keyframes the easing type doesn't account for bezier functions
 * and we also need to use internal .build() function to make the easing apply on each mount.
 *
 * This causes problems with both eslint & Typescript and is going to be fixed in react-native-reanimated 3.17 with these PRs merged:
 * https://github.com/software-mansion/react-native-reanimated/pull/6960
 * https://github.com/software-mansion/react-native-reanimated/pull/6958
 *
 * Once that's added we can apply our changes to files in BottomDockedModal/Backdrop/*.tsx and BottomDockedModal/Container/*.tsx
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
function Backdrop({
    style,
    customBackdrop,
    onBackdropPress,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
}: BackdropProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const Entering = useMemo(() => {
        const FadeIn = new Keyframe({
            from: {opacity: 0},
            to: {
                opacity: 0.72,
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
                easing,
            },
        });

        // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
        return FadeIn.duration(animationInTiming).build() as ReanimatedKeyframe;
    }, [animationInTiming]);

    const Exiting = useMemo(() => {
        const FadeOut = new Keyframe({
            from: {opacity: 0.72},
            to: {
                opacity: 0,
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
                easing,
            },
        });

        // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
        return FadeOut.duration(animationOutTiming).build() as ReanimatedKeyframe;
    }, [animationOutTiming]);

    const BackdropOverlay = useMemo(
        () => (
            <Animated.View
                entering={Entering}
                exiting={Exiting}
                style={[styles.modalBackdrop, style]}
            >
                {!!customBackdrop && customBackdrop}
            </Animated.View>
        ),
        [Entering, Exiting, customBackdrop, style, styles.modalBackdrop],
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

Backdrop.displayName = 'Backdrop';

export default Backdrop;
