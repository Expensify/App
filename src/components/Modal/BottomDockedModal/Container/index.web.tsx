import React, {useEffect, useMemo, useRef} from 'react';
import Animated, {Easing, Keyframe} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';
import useThemeStyles from '@hooks/useThemeStyles';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function Container({style, animationInTiming = 300, animationOutTiming = 300, onOpenCallBack, onCloseCallBack, ...props}: ModalProps & ContainerProps) {
    const styles = useThemeStyles();
    const onCloseCallbackRef = useRef(onCloseCallBack);

    useEffect(() => {
        onCloseCallbackRef.current = onCloseCallBack;
    }, [onCloseCallBack]);

    const Entering = useMemo(() => {
        const FadeIn = new Keyframe({
            from: {opacity: 0},
            to: {
                opacity: 1,
                easing,
            },
        });

        return FadeIn.duration(animationInTiming).withCallback(onOpenCallBack);
    }, [animationInTiming, onOpenCallBack]);

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
            style={[style, styles.modalContainer, styles.modalAnimatedContainer]}
            exiting={Exiting}
            entering={Entering}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            {props.children}
        </Animated.View>
    );
}

Container.displayName = 'ModalContainer';

export default Container;
