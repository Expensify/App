import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';
import type {ContainerProps} from '@components/Modal/ReanimatedModal/types';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {Keyframe} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import GestureHandler from './GestureHandler';

function Container({
    style,
    animationInTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN,
    animationOutTiming = CONST.MODAL.ANIMATION_TIMING.DEFAULT_OUT,
    onCloseCallBack,
    onOpenCallBack,
    animationIn,
    animationOut,
    type,
    onSwipeComplete,
    swipeDirection,
    swipeThreshold = 100,
    ...props
}: Partial<ReanimatedModalProps> & ContainerProps) {
    const styles = useThemeStyles();

    const bottom = StyleSheet.flatten(style)?.bottom;
    const bottomSlideOffset = (animationIn === 'slideInUp' || animationOut === 'slideOutDown') && typeof bottom === 'number' ? Math.max(0, bottom) : 0;
    // Include the anchor's bottom gap in the animated height so a 100% slide reaches the screen edge.
    const positionStyle = bottomSlideOffset > 0 ? {bottom: 0} : undefined;
    const slidePaddingStyle = bottomSlideOffset > 0 ? {paddingBottom: bottomSlideOffset} : undefined;

    const Entering = useMemo(() => {
        const AnimationIn = new Keyframe(getModalInAnimation(animationIn));

        return AnimationIn.duration(animationInTiming).withCallback(() => {
            'worklet';

            scheduleOnRN(onOpenCallBack);
        });
    }, [animationIn, animationInTiming, onOpenCallBack]);

    const Exiting = useMemo(() => {
        const AnimationOut = new Keyframe(getModalOutAnimation(animationOut));

        return AnimationOut.duration(animationOutTiming).withCallback(() => {
            'worklet';

            scheduleOnRN(onCloseCallBack);
        });
    }, [animationOutTiming, onCloseCallBack, animationOut]);

    return (
        <View
            style={[style, positionStyle]}
            {...props}
        >
            <GestureHandler
                swipeThreshold={swipeThreshold}
                swipeDirection={swipeDirection}
                onSwipeComplete={onSwipeComplete}
            >
                <Animated.View
                    pointerEvents="box-none"
                    style={[styles.modalAnimatedContainer, type !== CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED && styles.flex1, slidePaddingStyle]}
                    entering={Entering}
                    exiting={Exiting}
                >
                    {props.children}
                </Animated.View>
            </GestureHandler>
        </View>
    );
}

export default Container;
