import type {MutableRefObject} from 'react';
import type {Animated, PanResponderGestureState} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import {withSpring} from 'react-native-reanimated';
import {
    calcDistancePercentage,
    createAnimationEventForSwipe,
    getAccDistancePerDirection,
    getSwipingDirection,
    isDirectionIncluded,
    isSwipeDirectionAllowed,
    shouldPropagateSwipe,
} from './panHandlers';
import type {AnimationEvent, Direction, GestureProps, GestureResponderEvent} from './types';

function handleSwipe(dx: number, dy: number, Xoffset: SharedValue<number>, Yoffset: SharedValue<number>, swipeDirection?: Direction | Direction[]) {
    if (!swipeDirection) {
        return;
    }

    if ((isDirectionIncluded('left', swipeDirection) && dx < 0) || (isDirectionIncluded('right', swipeDirection) && dx > 0)) {
        Xoffset.set(dx);
    }
    if ((isDirectionIncluded('up', swipeDirection) && dy < 0) || (isDirectionIncluded('down', swipeDirection) && dy > 0)) {
        Yoffset.set(dy);
    }
}

const onMoveShouldSetPanResponder = (
    props: GestureProps,
    setCurrentAnimEvt: (currentAnim: AnimationEvent) => void,
    setCurrentSwipingDirection: (direction: Direction | null) => void,
    pan: Animated.ValueXY,
) => {
    return (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        if (!shouldPropagateSwipe(event, gestureState, props.propagateSwipe) && props.panResponderThreshold !== undefined) {
            const shouldSetPanResponder = Math.abs(gestureState.dx) >= props.panResponderThreshold || Math.abs(gestureState.dy) >= props.panResponderThreshold;
            if (shouldSetPanResponder) {
                props.onSwipeStart?.(gestureState);
            }
            const currentSwipingDirection = getSwipingDirection(gestureState);
            setCurrentSwipingDirection(currentSwipingDirection);
            setCurrentAnimEvt(createAnimationEventForSwipe(currentSwipingDirection, pan));
            return shouldSetPanResponder;
        }

        return false;
    };
};

type EnhancedGestureEvent = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
    _dispatchInstances: any;
} & GestureResponderEvent;

// using _dispatchInstances causes typing problems
const onStartShouldSetPanResponder = (props: GestureProps, setCurrentSwipingDirection: (direction: Direction | null) => void) => {
    return (event: EnhancedGestureEvent, gestureState: PanResponderGestureState) => {
        // eslint-disable-next-line
        const hasScrollableView = event._dispatchInstances ?? event._dispatchInstances.some((instance: {type: string}) => /scrollview|flatlist/i.test(instance.type));

        if (hasScrollableView && shouldPropagateSwipe(event, gestureState) && props.scrollTo && props.scrollOffset && props.scrollOffset > 0) {
            return false;
        }
        props.onSwipeStart?.(gestureState);
        setCurrentSwipingDirection(null);
        return true;
    };
};

const onPanResponderMove = (
    props: GestureProps,
    currentSwipingDirectionRef: MutableRefObject<Direction | null>,
    setCurrentSwipingDirection: (direction: Direction | null) => void,
    setCurrentAnimEvt: (currentAnim: AnimationEvent | null) => void,
    animEvt: MutableRefObject<AnimationEvent | null>,
    pan: Animated.ValueXY,
    deviceHeight: number,
    deviceWidth: number,
    xOffset: SharedValue<number>,
    yOffset: SharedValue<number>,
    swipeDirection?: Direction | Direction[],
) => {
    return (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        handleSwipe(gestureState.dx, gestureState.dy, xOffset, yOffset, swipeDirection);
        const currentSwipingDirection = currentSwipingDirectionRef.current;
        if (!currentSwipingDirection) {
            if (gestureState.dx === 0 && gestureState.dy === 0) {
                return;
            }
            setCurrentSwipingDirection(getSwipingDirection(gestureState));
            setCurrentAnimEvt(createAnimationEventForSwipe(currentSwipingDirection, pan));
        }
        if (isSwipeDirectionAllowed(gestureState, currentSwipingDirection)) {
            const newOpacityFactor = 1 - calcDistancePercentage(gestureState, currentSwipingDirection, props.deviceHeight ?? deviceHeight, props.deviceWidth ?? deviceWidth);

            animEvt.current?.(event, gestureState);

            props.onSwipeMove?.(newOpacityFactor, gestureState);
        } else {
            if (props.scrollOffsetMax === undefined) {
                return;
            }
            if (props.scrollHorizontal) {
                let offsetX = -gestureState.dx;
                if (offsetX > props.scrollOffsetMax) {
                    offsetX -= (offsetX - props.scrollOffsetMax) / 2;
                }

                props.scrollTo?.({x: offsetX, animated: false});
            } else {
                let offsetY = -gestureState.dy;
                if (offsetY > props.scrollOffsetMax) {
                    offsetY -= (offsetY - props.scrollOffsetMax) / 2;
                }

                props.scrollTo?.({y: offsetY, animated: false});
            }
        }
    };
};

const onPanResponderRelease = (
    props: GestureProps,
    currentSwipingDirectionRef: MutableRefObject<Direction | null>,
    setInSwipeClosingState: (val: boolean) => void,
    xOffset: SharedValue<number>,
    yOffset: SharedValue<number>,
) => {
    return (_: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const currentSwipingDirection = currentSwipingDirectionRef.current;
        const accDistance = getAccDistancePerDirection(gestureState, currentSwipingDirection);
        if (props.swipeThreshold && accDistance > props.swipeThreshold && isSwipeDirectionAllowed(gestureState, currentSwipingDirection, props.swipeDirection) && props.onSwipeComplete) {
            setInSwipeClosingState(true);
            props.onSwipeComplete(
                {
                    swipingDirection: getSwipingDirection(gestureState),
                },
                gestureState,
            );
            xOffset.set(0);
            yOffset.set(0);

            return;
        }

        props.onSwipeCancel?.(gestureState);

        xOffset.set(withSpring(0));
        yOffset.set(withSpring(0));

        if (props.scrollOffset !== undefined && props.scrollOffsetMax !== undefined && props.scrollOffset > props.scrollOffsetMax) {
            props.scrollTo?.({
                y: props.scrollOffsetMax,
                animated: true,
            });
        }
    };
};

export type {EnhancedGestureEvent};
export {onMoveShouldSetPanResponder, onStartShouldSetPanResponder, onPanResponderMove, onPanResponderRelease};
