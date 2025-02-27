import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated, {Easing, Keyframe, runOnJS} from 'react-native-reanimated';
import type {ReanimatedKeyframe} from 'react-native-reanimated/lib/typescript/layoutReanimation/animationBuilder/Keyframe';
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
function Container({style, animationInTiming = 300, animationOutTiming = 300, onCloseCallBack, onOpenCallBack, ...props}: Partial<ModalProps> & ContainerProps) {
    const styles = useThemeStyles();

    const Entering = useMemo(() => {
        const SlideIn = new Keyframe({
            from: {transform: [{translateY: '100%'}]},
            to: {
                transform: [{translateY: '0%'}],
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
                easing,
            },
        });

        return (
            SlideIn.duration(animationInTiming)
                .withCallback(() => {
                    'worklet';

                    runOnJS(onOpenCallBack)();
                })
                // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
                .build() as ReanimatedKeyframe
        );
    }, [animationInTiming, onOpenCallBack]);

    const Exiting = useMemo(() => {
        const SlideOut = new Keyframe({
            from: {transform: [{translateY: '0%'}]},
            to: {
                transform: [{translateY: '100%'}],
                // @ts-expect-error Types mismatch in reanimated, should to be fixed in 3.17
                easing,
            },
        });

        return (
            SlideOut.duration(animationOutTiming)
                .withCallback(() => {
                    'worklet';

                    runOnJS(onCloseCallBack)();
                })
                // @ts-expect-error Internal function used to fix easing issue, should to be fixed in 3.17
                .build() as ReanimatedKeyframe
        );
    }, [animationOutTiming, onCloseCallBack]);

    return (
        <View
            style={[style, styles.modalContainer]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View
                style={styles.modalAnimatedContainer}
                entering={Entering}
                exiting={Exiting}
            >
                {props.children}
            </Animated.View>
        </View>
    );
}

Container.displayName = 'ModalContainer';

export default Container;
