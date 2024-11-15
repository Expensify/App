import type {GestureResponderEvent, PanResponderGestureState} from 'react-native';
import {Animated} from 'react-native';
import type {Direction} from './types';
import {isSwipeHorizontal} from './utils';

const reversePercentage = (x: number) => -(x - 1);

const calcDistancePercentage = (gestureState: PanResponderGestureState, currentSwipingDirection: Direction | null, deviceHeight: number, deviceWidth: number): number => {
    const {moveY, moveX, y0, x0} = gestureState;

    const deltaY = moveY - y0;
    const deltaX = moveX - x0;

    switch (currentSwipingDirection) {
        case 'down':
            return deviceHeight - y0 > 0 ? deltaY / (deviceHeight - y0) : 0;

        case 'up':
            return y0 > 0 ? reversePercentage(moveY / y0) : 0;

        case 'left':
            return x0 > 0 ? reversePercentage(moveX / x0) : 0;

        case 'right':
            return deviceWidth - x0 > 0 ? deltaX / (deviceWidth - x0) : 0;

        default:
            return 0;
    }
};

const getAccDistancePerDirection = (gestureState: PanResponderGestureState, currentSwipingDirection: Direction | null): number => {
    switch (currentSwipingDirection) {
        case 'up':
            return -gestureState.dy;
        case 'down':
            return gestureState.dy;
        case 'right':
            return gestureState.dx;
        case 'left':
            return -gestureState.dx;
        default:
            return 0;
    }
};

const createAnimationEventForSwipe = (currentSwipingDirection: Direction | null, pan: Animated.ValueXY) => {
    if (isSwipeHorizontal(currentSwipingDirection)) {
        return Animated.event([null, {dx: pan.x}], {
            useNativeDriver: false,
        });
    }
    return Animated.event([null, {dy: pan.y}], {
        useNativeDriver: false,
    });
};

const isDirectionIncluded = (direction: Direction, swipeDirection?: Direction | Direction[]) => {
    return Array.isArray(swipeDirection) ? swipeDirection.includes(direction) : swipeDirection === direction;
};

const isSwipeDirectionAllowed = ({dy, dx}: PanResponderGestureState, currentSwipingDirection: Direction | null, swipeDirection?: Direction | Direction[]) => {
    if (!currentSwipingDirection) {
        return false;
    }

    const directionMap = {
        up: dy < 0,
        down: dy > 0,
        left: dx < 0,
        right: dx > 0,
    };

    return isDirectionIncluded(currentSwipingDirection, swipeDirection) && directionMap[currentSwipingDirection];
};

const getSwipingDirection = ({dx, dy}: PanResponderGestureState): Direction => {
    const xDirection = dx > 0 ? 'right' : 'left';
    const yDirection = dy > 0 ? 'down' : 'up';
    return Math.abs(dx) > Math.abs(dy) ? xDirection : yDirection;
};

const shouldPropagateSwipe = (
    evt: GestureResponderEvent,
    gestureState: PanResponderGestureState,
    propagateSwipe: boolean | ((event: GestureResponderEvent, gestureState: PanResponderGestureState) => boolean) = false,
) => {
    return typeof propagateSwipe === 'function' ? propagateSwipe(evt, gestureState) : propagateSwipe;
};

export {shouldPropagateSwipe, getSwipingDirection, isSwipeDirectionAllowed, calcDistancePercentage, getAccDistancePerDirection, createAnimationEventForSwipe};
