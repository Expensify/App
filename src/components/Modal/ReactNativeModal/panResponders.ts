import type {MutableRefObject} from 'react';
import type {PanResponderGestureState} from 'react-native';
import {Animated} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import {calcDistancePercentage, createAnimationEventForSwipe, getAccDistancePerDirection, getSwipingDirection, isSwipeDirectionAllowed, shouldPropagateSwipe} from './panHandlers';
import type {AnimationEvent, Direction, GestureResponderEvent} from './types';

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

        if (hasScrollableView && shouldPropagateSwipe(e, gestureState) && props.scrollTo && props.scrollOffset > 0) {
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
    currentSwipingDirection: Direction | null,
    setCurrentSwipingDirection: (direction: Direction | null) => void,
    setCurrentAnimEvt: (currentAnim: AnimationEvent | null) => void,
    animEvt: MutableRefObject<AnimationEvent | null>,
    pan: Animated.ValueXY,
    deviceHeight: number,
    deviceWidth: number,
) => {
    return (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
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
            if (!props.scrollTo) {
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
const onPanResponderRelease = (props: RemainingModalProps, currentSwipingDirection: Direction | null, setInSwipeClosingState: (val: boolean) => void, pan: Animated.ValueXY) => {
    return (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const accDistance = getAccDistancePerDirection(gestureState, currentSwipingDirection);
        if (accDistance > props.swipeThreshold && isSwipeDirectionAllowed(gestureState, currentSwipingDirection, props.swipeDirection)) {
            if (props.onSwipeComplete) {
                setInSwipeClosingState(true);
                props.onSwipeComplete(
                    {
                        swipingDirection: getSwipingDirection(gestureState),
                    },
                    gestureState,
                );
                return;
            }
        }

        if (props.onSwipeCancel) {
            props.onSwipeCancel(gestureState);
        }

        Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            bounciness: 0,
            useNativeDriver: false,
        }).start();

        if (props.scrollTo) {
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
