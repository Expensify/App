import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import Animated, {Keyframe, runOnJS} from 'react-native-reanimated';
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

        return AnimationIn.duration(animationInTiming);
    }, [animationIn, animationInTiming]);

    const Exiting = useMemo(() => {
        const AnimationOut = new Keyframe(getModalOutAnimation(animationOut));

        return AnimationOut.duration(animationOutTiming).withCallback(() => {
            'worklet';

            runOnJS(onCloseCallBack)();
        });
    }, [animationOutTiming, onCloseCallBack, animationOut]);

    // Temporary solution to run animation callbacks even with reduced motion setting turned on
    // since .reduceMotion method doesn't work in the current version of Reanimated (https://github.com/software-mansion/react-native-reanimated/issues/8046)
    // We will remove this once fixed upstream https://github.com/Expensify/App/issues/69190
    useEffect(() => {
        setTimeout(onOpenCallBack, animationInTiming);

        return () => {
            setTimeout(onCloseCallBack, animationOutTiming);
        };
        // calling callbacks only when the layout animations are run - on mount and unmount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

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

Container.displayName = 'ModalContainer';

export default Container;
