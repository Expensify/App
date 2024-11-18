import React from 'react';
import Animated, {runOnJS, SlideInDown, SlideOutDown} from 'react-native-reanimated';
import type ModalProps from './types';

function Container({style, ...props}: ModalProps & {onOpenCallBack: () => void; onCloseCallBack: () => void}) {
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
            <Animated.View style={{width: '100%', flex: 1, alignSelf: 'flex-end'}}>{props.children}</Animated.View>
        </Animated.View>
    );
}

export default Container;
