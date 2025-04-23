import React, {useEffect, useMemo} from 'react';
import Animated, {Easing, Keyframe, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';
import useThemeStyles from '@hooks/useThemeStyles';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function Container({style, animationInTiming = 300, animationOutTiming = 300, onOpenCallBack, onCloseCallBack, ...props}: ModalProps & ContainerProps) {
    const styles = useThemeStyles();
    const opacity = useSharedValue(0);
    const isInitiated = useSharedValue(false);

    useEffect(
        () => () => {
            setTimeout(onCloseCallBack, animationOutTiming);
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    useEffect(() => {
        if (isInitiated.get()) {
            return;
        }
        isInitiated.set(true);
        opacity.set(
            withTiming(1, {duration: animationInTiming}, () => {
                'worklet';

                runOnJS(onOpenCallBack)();
            }),
        );
    }, [animationInTiming, onOpenCallBack, opacity, isInitiated]);

    const animatedStyles = useAnimatedStyle(() => {
        'worklet';

        return {opacity: opacity.get()};
    }, [opacity]);

    const Exiting = useMemo(() => {
        const FadeOut = new Keyframe({
            from: {opacity: 1},
            to: {
                opacity: 0,
                easing,
            },
        });

        return FadeOut.duration(animationOutTiming);
    }, [animationOutTiming]);

    return (
        <Animated.View
            style={[style, styles.modalContainer]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View
                style={[styles.modalAnimatedContainer, animatedStyles]}
                exiting={Exiting}
            >
                {props.children}
            </Animated.View>
        </Animated.View>
    );
}

Container.displayName = 'ModalContainer';

export default Container;
