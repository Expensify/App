import type {MutableRefObject} from 'react';
import type {Animated, PanResponderGestureState} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import {withSpring} from 'react-native-reanimated';
import {calcDistancePercentage, createAnimationEventForSwipe, getAccDistancePerDirection, getSwipingDirection, isSwipeDirectionAllowed, shouldPropagateSwipe} from './panHandlers';
import type {AnimationEvent, Direction, GestureResponderEvent} from './types';
import type ModalProps from './types';

function handleSwipe(swipeDirection: Direction, dx: number, dy: number, Xoffset: SharedValue<number>, Yoffset: SharedValue<number>) {
    if (swipeDirection === 'right' && dx > 0) {
        Xoffset.value = dx;
    } else if (swipeDirection === 'left' && dx < 0) {
        Xoffset.value = dx;
    } else if (swipeDirection === 'up' && dy < 0) {
        Yoffset.value = dy;
    } else if (swipeDirection === 'down' && dy > 0) {
        Yoffset.value = dy;
    }
}

type RemainingModalProps = Omit<
    ModalProps,
    | 'animationIn'
    | 'animationOut'
    | 'animationInTiming'
    | 'animationOutTiming'
    | 'backdropTransitionInTiming'
    | 'backdropTransitionOutTiming'
    | 'children'
    | 'coverScreen'
    | 'customBackdrop'
    | 'hasBackdrop'
    | 'backdropColor'
    | 'backdropOpacity'
    | 'useNativeDriver'
    | 'isVisible'
    | 'onBackButtonPress'
    | 'onModalShow'
    | 'testID'
    | 'style'
    | 'avoidKeyboard'
    | 'testName'
>;

type EnhancedGestureEvent = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
    _dispatchInstances: any;
} & GestureResponderEvent;

const onMoveShouldSetPanResponder = (
    props: RemainingModalProps,
    setCurrentAnimEvt: (currentAnim: AnimationEvent) => void,
    setCurrentSwipingDirection: (direction: Direction | null) => void,
    pan: Animated.ValueXY,
) => {
    return (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        console.log('______________-');
        console.log(pan.getTranslateTransform());
        console.log('______________-');
        if (!shouldPropagateSwipe(evt, gestureState, props.propagateSwipe)) {
            const shouldSetPanResponder = Math.abs(gestureState.dx) >= props.panResponderThreshold || Math.abs(gestureState.dy) >= props.panResponderThreshold;
            if (shouldSetPanResponder && props.onSwipeStart) {
                props.onSwipeStart(gestureState);
            }
            const currentSwipingDirection = getSwipingDirection(gestureState);
            setCurrentSwipingDirection(currentSwipingDirection);
            setCurrentAnimEvt(createAnimationEventForSwipe(currentSwipingDirection, pan));
            return shouldSetPanResponder;
        }

        return false;
    };
};

// using _dispatchInstances causes typing problems
const onStartShouldSetPanResponder = (props: RemainingModalProps, setCurrentSwipingDirection: (direction: Direction | null) => void) => {
    return (e: EnhancedGestureEvent, gestureState: PanResponderGestureState) => {
        // eslint-disable-next-line
        const hasScrollableView = e._dispatchInstances ?? e._dispatchInstances.some((instance: any) => /scrollview|flatlist/i.test(instance.type));

        if (hasScrollableView && shouldPropagateSwipe(e, gestureState) && props.scrollTo && props.scrollOffset && props.scrollOffset > 0) {
            return false;
        }
        if (props.onSwipeStart) {
            props.onSwipeStart(gestureState);
        }
        setCurrentSwipingDirection(null);
        return true;
    };
};

const onPanResponderMove = (
    props: RemainingModalProps,
    currentSwipingDirectionRef: MutableRefObject<Direction | null>,
    setCurrentSwipingDirection: (direction: Direction | null) => void,
    setCurrentAnimEvt: (currentAnim: AnimationEvent | null) => void,
    animEvt: MutableRefObject<AnimationEvent | null>,
    pan: Animated.ValueXY,
    deviceHeight: number,
    deviceWidth: number,
    xOffset: SharedValue<number>,
    yOffset: SharedValue<number>,
    swipeDirection: Direction,
) => {
    return (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        console.log('______________-');
        console.log(swipeDirection);
        console.log('______________-');
        handleSwipe(swipeDirection, gestureState.dx, gestureState.dy, xOffset, yOffset);
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

            animEvt.current?.(evt, gestureState);

            if (props.onSwipeMove) {
                props.onSwipeMove(newOpacityFactor, gestureState);
            }
        } else {
            if (!props.scrollTo || props.scrollOffsetMax === undefined) {
                return;
            }
            if (props.scrollHorizontal) {
                let offsetX = -gestureState.dx;
                if (offsetX > props.scrollOffsetMax) {
                    offsetX -= (offsetX - props.scrollOffsetMax) / 2;
                }

                props.scrollTo({x: offsetX, animated: false});
            } else {
                let offsetY = -gestureState.dy;
                if (offsetY > props.scrollOffsetMax) {
                    offsetY -= (offsetY - props.scrollOffsetMax) / 2;
                }

                props.scrollTo({y: offsetY, animated: false});
            }
        }
    };
};

const onPanResponderRelease = (
    props: RemainingModalProps,
    currentSwipingDirectionRef: MutableRefObject<Direction | null>,
    setInSwipeClosingState: (val: boolean) => void,
    pan: Animated.ValueXY,
    xOffset: SharedValue<number>,
    yOffset: SharedValue<number>,
) => {
    return (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const currentSwipingDirection = currentSwipingDirectionRef.current;
        const accDistance = getAccDistancePerDirection(gestureState, currentSwipingDirection);
        if (props.swipeThreshold && accDistance > props.swipeThreshold && isSwipeDirectionAllowed(gestureState, currentSwipingDirection, props.swipeDirection)) {
            if (props.onSwipeComplete) {
                setInSwipeClosingState(true);
                props.onSwipeComplete(
                    {
                        swipingDirection: getSwipingDirection(gestureState),
                    },
                    gestureState,
                );
                // eslint-disable-next-line no-param-reassign
                xOffset.value = 0;
                // eslint-disable-next-line no-param-reassign
                yOffset.value = 0;
                return;
            }
        }

        if (props.onSwipeCancel) {
            props.onSwipeCancel(gestureState);
        }

        // eslint-disable-next-line no-param-reassign
        xOffset.value = withSpring(0);
        // eslint-disable-next-line no-param-reassign
        yOffset.value = withSpring(0);

        if (props.scrollTo && props.scrollOffset !== undefined && props.scrollOffsetMax !== undefined) {
            if (props.scrollOffset > props.scrollOffsetMax) {
                props.scrollTo({
                    y: props.scrollOffsetMax,
                    animated: true,
                });
            }
        }
    };
};

export type {EnhancedGestureEvent};
export {onMoveShouldSetPanResponder, onStartShouldSetPanResponder, onPanResponderMove, onPanResponderRelease};
