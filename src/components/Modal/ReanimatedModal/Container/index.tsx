import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated, {Keyframe} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import type ReanimatedModalProps from '@components/Modal/ReanimatedModal/types';
import type {ContainerProps} from '@components/Modal/ReanimatedModal/types';
import {getModalInAnimation, getModalOutAnimation} from '@components/Modal/ReanimatedModal/utils';
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
}: Partial<ReanimatedModalProps> & ContainerProps) {
    const styles = useThemeStyles();

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
            style={style}
            // eslint-disable-next-line react/jsx-props-no-spreading
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
