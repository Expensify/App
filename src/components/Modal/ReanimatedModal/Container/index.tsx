import React from 'react';
import {View} from 'react-native';
import Animated, {Keyframe} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import type {ContainerProps} from '@components/Modal/ReanimatedModal/types';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
import useAnimationTransition from '@hooks/useAnimationTransition';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
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
}: ContainerProps) {
    const styles = useThemeStyles();
    const {onAnimationComplete} = useAnimationTransition();

    const Entering = new Keyframe(getModalInAnimation(animationIn)).duration(animationInTiming).withCallback(() => {
        'worklet';

        scheduleOnRN(onOpenCallBack);
        scheduleOnRN(onAnimationComplete);
    });

    const Exiting = new Keyframe(getModalOutAnimation(animationOut)).duration(animationOutTiming).withCallback(() => {
        'worklet';

        scheduleOnRN(onCloseCallBack);
        scheduleOnRN(onAnimationComplete);
    });

    return (
        <View
            style={style}
            {...props}
        >
            <GestureHandler
                swipeThreshold={swipeThreshold}
                swipeDirection={swipeDirection}
                onSwipeComplete={onSwipeComplete}
            >
                <Animated.View
                    style={[styles.modalAnimatedContainer, type !== CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED && styles.flex1]}
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
