import React, {useEffect, useMemo} from 'react';
import Animated, {Easing, Keyframe, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';
import useThemeStyles from '@hooks/useThemeStyles';

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
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
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
