import React, {useEffect, useMemo, useRef} from 'react';
import Animated, {Easing, Keyframe, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';
import useThemeStyles from '@hooks/useThemeStyles';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function Container({style, animationInTiming = 300, animationOutTiming = 300, onOpenCallBack, onCloseCallBack, ...props}: ModalProps & ContainerProps) {
    const styles = useThemeStyles();
    const onCloseCallbackRef = useRef(onCloseCallBack);
    const opacity = useSharedValue(0);
    const isInitiated = useSharedValue(false);

    useEffect(() => {
        onCloseCallbackRef.current = onCloseCallBack;
    }, [onCloseCallBack]);

    useEffect(() => {
        if (isInitiated.get()) {
            return;
        }
        isInitiated.set(true);
        opacity.set(withTiming(1, {duration: animationInTiming, easing}, onOpenCallBack));
    }, [animationInTiming, onOpenCallBack, opacity, isInitiated]);

    const animatedStyles = useAnimatedStyle(() => ({opacity: opacity.get()}), [opacity]);

    const Exiting = useMemo(() => {
        const FadeOut = new Keyframe({
            from: {opacity: 1},
            to: {
                opacity: 0,
                easing,
            },
        });

        // eslint-disable-next-line react-compiler/react-compiler
        return FadeOut.duration(animationOutTiming).withCallback(() => onCloseCallbackRef.current());
    }, [animationOutTiming]);

    return (
        <Animated.View
            style={[style, styles.modalContainer, styles.modalAnimatedContainer, animatedStyles]}
            exiting={Exiting}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {props.children}
        </Animated.View>
    );
}

Container.displayName = 'ModalContainer';

export default Container;
