import React, {useEffect, useMemo} from 'react';
import Animated, {Easing, Keyframe, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';

/* eslint-disable @typescript-eslint/naming-convention */
const FadeOutKeyframe = new Keyframe({
    0: {opacity: 1},
    100: {opacity: 0, easing: Easing.out(Easing.ease)},
});

function Container({style, animationInTiming = 300, animationOutTiming = 300, onOpenCallBack, onCloseCallBack, ...props}: ModalProps & ContainerProps) {
    const sv = useSharedValue(0);
    const initiated = useSharedValue(false);

    useEffect(() => {
        if (initiated.get()) {
            return;
        }
        initiated.set(true);
        sv.set(
            withTiming(1, {duration: animationInTiming, easing: Easing.out(Easing.ease)}, () => {
                'worklet';

                runOnJS(onOpenCallBack)();
            }),
        );
    }, [animationInTiming, onOpenCallBack, sv, initiated]);

    const animatedStyles = useAnimatedStyle(() => {
        'worklet';

        return {opacity: sv.get()};
    }, [sv]);

    const FadeOut = useMemo(() => {
        return FadeOutKeyframe.duration(animationOutTiming).withCallback(() => {
            'worklet';

            runOnJS(onCloseCallBack)();
        });
    }, [animationOutTiming, onCloseCallBack]);

    return (
        <Animated.View
            style={[style, {height: '100%'}]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View
                style={[{width: '100%'}, animatedStyles]}
                exiting={FadeOut}
            >
                {props.children}
            </Animated.View>
        </Animated.View>
    );
}

Container.displayName = 'ModalContainer';
export default Container;
