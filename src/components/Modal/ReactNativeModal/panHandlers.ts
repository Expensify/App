import type {GestureResponderEvent, PanResponderGestureState} from 'react-native';
import {Animated} from 'react-native';
import type {Direction} from './types';
import type ModalProps from './types';

const reversePercentage = (x: number) => -(x - 1);

const calcDistancePercentage = (gestureState: PanResponderGestureState, currentSwipingDirection: Direction | null, deviceHeight: number, deviceWidth: number) => {
    switch (currentSwipingDirection) {
        case 'down':
            return (gestureState.moveY - gestureState.y0) / (deviceHeight - gestureState.y0);
        case 'up':
            return reversePercentage(gestureState.moveY / gestureState.y0);
        case 'left':
            return reversePercentage(gestureState.moveX / gestureState.x0);
        case 'right':
            return (gestureState.moveX - gestureState.x0) / (deviceWidth - gestureState.x0);

        default:
            return 0;
    }
};

const getAccDistancePerDirection = (gestureState: PanResponderGestureState, currentSwipingDirection: Direction | null) => {
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
    if (currentSwipingDirection === 'right' || currentSwipingDirection === 'left') {
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
    const draggedDown = dy > 0;
    const draggedUp = dy < 0;
    const draggedLeft = dx < 0;
    const draggedRight = dx > 0;
    console.log('isSwipeDirectionAllowed: ', currentSwipingDirection);
    if (currentSwipingDirection === 'up' && isDirectionIncluded('up', swipeDirection) && draggedUp) {
        return true;
    }
    if (currentSwipingDirection === 'down' && isDirectionIncluded('down', swipeDirection) && draggedDown) {
        return true;
    }
    if (currentSwipingDirection === 'right' && isDirectionIncluded('right', swipeDirection) && draggedRight) {
        return true;
    }
    if (currentSwipingDirection === 'left' && isDirectionIncluded('left', swipeDirection) && draggedLeft) {
        return true;
    }
    return false;
};

const getSwipingDirection = (gestureState: PanResponderGestureState) => {
    if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        return gestureState.dx > 0 ? 'right' : 'left';
    }

    return gestureState.dy > 0 ? 'down' : 'up';
};

const shouldPropagateSwipe = (evt: GestureResponderEvent, gestureState: PanResponderGestureState, propagateSwipe?: ModalProps['propagateSwipe']) => {
    return typeof propagateSwipe === 'function' ? propagateSwipe(evt, gestureState) : propagateSwipe;
};

// const initiatePanResponder = (propagateSwipe, panResponderThreshold, onSwipeStart, pan, scrollTo, scrollOffset, swipeDirection, deviceHeight, deviceHeightState,   deviceWidth, deviceWidthState, backdropRef, backdropOpacity, onSwipeMove, scrollHorizontal, scrollOffsetMax, swipeThreshold, onSwipeComplete, inSwipeClosingState, onSwipe, inSwipeClosingState, onSwipeCancel) => {
//   let animEvt: any = null;
//   let currentSwipingDirection: Direction | null = null;

//   return PanResponder.create({
//     onMoveShouldSetPanResponder: (evt, gestureState) => {
//       // Use propagateSwipe to allow inner content to scroll. See PR:
//       // https://github.com/react-native-community/react-native-modal/pull/246
//       if (!shouldPropagateSwipe(evt, gestureState, propagateSwipe)) {
//         // The number "4" is just a good tradeoff to make the panResponder
//         // work correctly even when the modal has touchable buttons.
//         // However, if you want to overwrite this and choose for yourself,
//         // set panResponderThreshold in the props.
//         // For reference:
//         // https://github.com/react-native-community/react-native-modal/pull/197
//         const shouldSetPanResponder = Math.abs(gestureState.dx) >= panResponderThreshold || Math.abs(gestureState.dy) >= panResponderThreshold;
//         if (shouldSetPanResponder && onSwipeStart) {
//           onSwipeStart(gestureState);
//         }

//         currentSwipingDirection = getSwipingDirection(gestureState);
//         animEvt = createAnimationEventForSwipe(currentSwipingDirection, pan);
//         return shouldSetPanResponder;
//       }

//       return false;
//     },
//     onStartShouldSetPanResponder: (e: any, gestureState) => {
//       const hasScrollableView = e._dispatchInstances?.some((instance: any) => /scrollview|flatlist/i.test(instance.type));

//       if (hasScrollableView && shouldPropagateSwipe(e, gestureState, propagateSwipe) && scrollTo && scrollOffset > 0) {
//         return false; // user needs to be able to scroll content back up
//       }
//       if (onSwipeStart) {
//         onSwipeStart(gestureState);
//       }

//       // Cleared so that onPanResponderMove can wait to have some delta
//       // to work with
//       currentSwipingDirection = null;
//       return true;
//     },
//     onPanResponderMove: (evt, gestureState) => {
//       // Using onStartShouldSetPanResponder we don't have any delta so we don't know
//       // The direction to which the user is swiping until some move have been done
//       if (!currentSwipingDirection) {
//         if (gestureState.dx === 0 && gestureState.dy === 0) {
//           return;
//         }

//         currentSwipingDirection = getSwipingDirection(gestureState);
//         animEvt = createAnimationEventForSwipe(currentSwipingDirection, pan);
//       }

//       if (isSwipeDirectionAllowed(gestureState, currentSwipingDirection, swipeDirection)) {
//         // Dim the background while swiping the modal
//         const newOpacityFactor = 1 - calcDistancePercentage(gestureState, currentSwipingDirection, deviceHeight ?? deviceHeightState, deviceWidth ?? deviceWidthState);

//         backdropRef?.transitionTo({
//           opacity: backdropOpacity * newOpacityFactor,
//         });

//         animEvt!(evt, gestureState);

//         if (onSwipeMove) {
//           onSwipeMove(newOpacityFactor, gestureState);
//         }
//       } else if (scrollTo) {
//         if (scrollHorizontal) {
//           let offsetX = -gestureState.dx;
//           if (offsetX > scrollOffsetMax) {
//             offsetX -= (offsetX - scrollOffsetMax) / 2;
//           }

//           scrollTo({ x: offsetX, animated: false });
//         } else {
//           let offsetY = -gestureState.dy;
//           if (offsetY > scrollOffsetMax) {
//             offsetY -= (offsetY - scrollOffsetMax) / 2;
//           }

//           scrollTo({ y: offsetY, animated: false });
//         }
//       }
//     },
//     onPanResponderRelease: (evt, gestureState) => {
//       // Call the onSwipe prop if the threshold has been exceeded on the right direction
//       const accDistance = getAccDistancePerDirection(gestureState, currentSwipingDirection);
//       if (accDistance > swipeThreshold && isSwipeDirectionAllowed(gestureState, currentSwipingDirection, swipeDirection)) {
//         if (onSwipeComplete) {
//           inSwipeClosingState = true;
//           onSwipeComplete(
//             {
//               swipingDirection: getSwipingDirection(gestureState),
//             },
//             gestureState,
//           );
//           return;
//         }
//         // Deprecated. Remove later.
//         if (onSwipe) {
//           inSwipeClosingState = true;
//           onSwipe();
//           return;
//         }
//       }

//       // Reset backdrop opacity and modal position
//       if (onSwipeCancel) {
//         onSwipeCancel(gestureState);
//       }

//       if (backdropRef) {
//         backdropRef.transitionTo({
//           opacity: backdropOpacity,
//         });
//       }

//       Animated.spring(pan, {
//         toValue: { x: 0, y: 0 },
//         bounciness: 0,
//         useNativeDriver: false,
//       }).start();

//       if (scrollTo) {
//         if (scrollOffset > scrollOffsetMax) {
//           scrollTo({
//             y: scrollOffsetMax,
//             animated: true,
//           });
//         }
//       }
//     },
//   });
// }

export {shouldPropagateSwipe, getSwipingDirection, isSwipeDirectionAllowed, calcDistancePercentage, getAccDistancePerDirection, createAnimationEventForSwipe};
