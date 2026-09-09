import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';
import type {ContainerProps} from '@components/Modal/ReanimatedModal/types';
import {easing, getModalInAnimationStyle, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect, useMemo, useRef} from 'react';
import Animated, {Keyframe, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';

/** Progress of the open animation once the container is fully shown. */
const SHOWN_PROGRESS = 1;

function Container({
    style,
    animationIn,
    animationOut,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
    onOpenCallBack,
    onCloseCallBack,
    type,
    ...props
}: ReanimatedModalProps & ContainerProps) {
    const styles = useThemeStyles();
    const onCloseCallbackRef = useRef(onCloseCallBack);
    const onOpenCallbackRef = useRef(onOpenCallBack);
    // The timing is captured at mount so a later change to it cannot restart an already running animation.
    const animationInTimingRef = useRef(animationInTiming);
    const initProgress = useSharedValue(0);

    useEffect(() => {
        onCloseCallbackRef.current = onCloseCallBack;
    }, [onCloseCallBack]);

    useEffect(() => {
        onOpenCallbackRef.current = onOpenCallBack;
    }, [onOpenCallBack]);

    // Reading the callback and the timing through refs leaves only the stable shared value as a dependency, so nothing but an effect remount can run this again.
    useEffect(() => {
        // A finished animation means the container is already shown, and replaying it would report a second open.
        // Progress survives an effect remount, so it tells a reveal or a StrictMode remount apart from a cancelled
        // animation, which is left below its target and does have to start again.
        if (initProgress.get() === SHOWN_PROGRESS) {
            return;
        }

        initProgress.set(
            withTiming(
                SHOWN_PROGRESS,
                {
                    duration: animationInTimingRef.current,
                    easing,
                    // on web the callbacks are not called when animations are disabled with the reduced motion setting on
                    // we enable the animations to make sure they are called
                    reduceMotion: ReduceMotion.Never,
                },
                () => onOpenCallbackRef.current(),
            ),
        );
    }, [initProgress]);

    // instead of an entering transition since keyframe animations break keyboard on mWeb Chrome (#62799)
    const animatedStyles = useAnimatedStyle(() => getModalInAnimationStyle(animationIn)(initProgress.get()), [initProgress]);

    const Exiting = useMemo(
        () =>
            new Keyframe(getModalOutAnimation(animationOut))
                .duration(animationOutTiming)
                .withCallback(() => onCloseCallbackRef.current())
                // on web the callbacks are not called when animations are disabled with the reduced motion setting on
                // we enable the animations to make sure they are called
                .reduceMotion(ReduceMotion.Never),
        [animationOutTiming, animationOut],
    );

    return (
        <Animated.View
            style={[style, type !== CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED && type !== CONST.MODAL.MODAL_TYPE.POPOVER && styles.modalAnimatedContainer, animatedStyles, {zIndex: 1}]}
            exiting={Exiting}
            {...props}
        >
            {props.children}
        </Animated.View>
    );
}

export default Container;
