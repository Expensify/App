import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated, {Keyframe, runOnJS} from 'react-native-reanimated';
import type ModalProps from '@components/Modal/BottomDockedModal/types';
import type {ContainerProps} from '@components/Modal/BottomDockedModal/types';

/* eslint-disable @typescript-eslint/naming-convention */
const EnteringKeyframe = new Keyframe({
    0: {transform: [{translateY: '100%'}]},
    100: {transform: [{translateY: '0%'}]},
});

const ExitingKeyframe = new Keyframe({
    0: {transform: [{translateY: '0%'}]},
    100: {transform: [{translateY: '100%'}]},
});

function Container({style, animationInDelay = 100, animationInTiming = 300, animationOutTiming = 300, onCloseCallBack, onOpenCallBack, ...props}: Partial<ModalProps> & ContainerProps) {
    const Entering = useMemo(() => {
        return EnteringKeyframe.delay(animationInDelay)
            .duration(animationInTiming)
            .withCallback(() => {
                'worklet';

                runOnJS(onOpenCallBack)();
            });
    }, [animationInDelay, animationInTiming, onOpenCallBack]);

    const Exiting = useMemo(() => {
        return ExitingKeyframe.duration(animationOutTiming).withCallback(() => {
            'worklet';

            runOnJS(onCloseCallBack)();
        });
    }, [animationOutTiming, onCloseCallBack]);

    return (
        <View
            style={[style, {height: '100%'}]}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View
                style={{width: '100%'}}
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
