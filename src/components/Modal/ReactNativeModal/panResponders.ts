import type {MutableRefObject} from 'react';
import type {Animated, PanResponderGestureState} from 'react-native';
import {createAnimationEventForSwipe, getSwipingDirection, shouldPropagateSwipe} from './panHandlers';
import type {AnimationEvent, Direction, GestureResponderEvent} from './types';
import type ModalProps from './types';

const onMoveShouldSetPanResponder = (props: ModalProps, animEvt: MutableRefObject<AnimationEvent | null>, currentSwipingDirection: Direction | null, pan: Animated.ValueXY) => {
    return (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // Use propagateSwipe to allow inner content to scroll. See PR:
        // https://github.com/react-native-community/react-native-modal/pull/246
        if (!shouldPropagateSwipe(evt, gestureState, props.propagateSwipe)) {
            // The number "4" is just a good tradeoff to make the panResponder
            // work correctly even when the modal has touchable buttons.
            // However, if you want to overwrite this and choose for yourself,
            // set panResponderThreshold in the props.
            // For reference:
            // https://github.com/react-native-community/react-native-modal/pull/197
            const shouldSetPanResponder = Math.abs(gestureState.dx) >= props.panResponderThreshold || Math.abs(gestureState.dy) >= props.panResponderThreshold;
            if (shouldSetPanResponder && props.onSwipeStart) {
                props.onSwipeStart(gestureState);
            }

            currentSwipingDirection = getSwipingDirection(gestureState);
            animEvt.current = createAnimationEventForSwipe(currentSwipingDirection, pan);
            return shouldSetPanResponder;
        }

        return false;
    };
};
