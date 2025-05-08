import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated, {Easing, Keyframe, runOnJS} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';
import useThemeStyles from '@hooks/useThemeStyles';

const easing = Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();

function Container({style, animationInTiming = 300, animationOutTiming = 300, onCloseCallBack, onOpenCallBack, ...props}: Partial<ModalProps> & ContainerProps) {
    const styles = useThemeStyles();

    const Entering = useMemo(() => {
        const SlideIn = new Keyframe({
            from: {transform: [{translateY: '100%'}]},
            to: {
                transform: [{translateY: '0%'}],
                easing,
            },
        });

        return SlideIn.duration(animationInTiming).withCallback(() => {
            'worklet';

            runOnJS(onOpenCallBack)();
        });
    }, [animationInTiming, onOpenCallBack]);

    const Exiting = useMemo(() => {
        const SlideOut = new Keyframe({
            from: {transform: [{translateY: '0%'}]},
            to: {
                transform: [{translateY: '100%'}],
                easing,
            },
        });

        return SlideOut.duration(animationOutTiming).withCallback(() => {
            'worklet';

            runOnJS(onCloseCallBack)();
        });
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
