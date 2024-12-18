import React from 'react';
import Animated, {runOnJS, SlideInDown, SlideOutDown, useAnimatedStyle} from 'react-native-reanimated';
import type ModalProps from './types';
import type {ContainerProps} from './types';

function Container({style, ...props}: ModalProps & ContainerProps) {
    const animatedStyles = useAnimatedStyle(() => {
        if (!props.panPosition) {
            return {};
        }
        return {
            transform: [{translateX: props.panPosition.translateX.value}, {translateY: props.panPosition.translateY.value}],
        };
    });
    return (
        <Animated.View
            style={[style, {flex: 1, height: '100%', flexDirection: 'row'}]}
            entering={SlideInDown.duration(300).withCallback(() => {
                runOnJS(props.onOpenCallBack)();
            })}
            exiting={SlideOutDown.duration(300).withCallback(() => {
                runOnJS(props.onCloseCallBack)();
            })}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        >
            <Animated.View style={[{width: '100%', flex: 1, alignSelf: 'flex-end'}, animatedStyles]}>{props.children}</Animated.View>
        </Animated.View>
    );
}

export default Container;
