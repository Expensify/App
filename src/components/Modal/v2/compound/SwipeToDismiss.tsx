import type {ReactNode} from 'react';
import React from 'react';
import type {GestureStateChangeEvent, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import CONST from '@src/CONST';
import type {SwipeDirection} from './types';

const DEFAULT_SWIPE_THRESHOLD_PX = 150;

type SwipeToDismissProps = {
    swipeDirections?: readonly SwipeDirection[];
    swipeThreshold?: number;
    onSwipeDismiss?: () => void;
    children: ReactNode;
};

function dismissedByGesture(
    e: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    initialPosition: {x: number; y: number},
    swipeThreshold: number,
    swipeDirections: readonly SwipeDirection[],
): boolean {
    'worklet';

    for (const direction of swipeDirections) {
        switch (direction) {
            case CONST.SWIPE_DIRECTION.RIGHT:
                if (e.translationX - initialPosition.x > swipeThreshold) {
                    return true;
                }
                break;
            case CONST.SWIPE_DIRECTION.LEFT:
                if (initialPosition.x - e.translationX > swipeThreshold) {
                    return true;
                }
                break;
            case CONST.SWIPE_DIRECTION.UP:
                if (initialPosition.y - e.translationY > swipeThreshold) {
                    return true;
                }
                break;
            case CONST.SWIPE_DIRECTION.DOWN:
                if (e.translationY - initialPosition.y > swipeThreshold) {
                    return true;
                }
                break;
            default:
                return false;
        }
    }
    return false;
}

function SwipeToDismiss({swipeDirections, swipeThreshold = DEFAULT_SWIPE_THRESHOLD_PX, onSwipeDismiss, children}: SwipeToDismissProps) {
    const initialTranslationX = useSharedValue(0);
    const initialTranslationY = useSharedValue(0);
    const isEnabled = !!swipeDirections?.length && !!onSwipeDismiss;

    const panGesture = Gesture.Pan()
        .onStart((e) => {
            initialTranslationX.set(e.translationX);
            initialTranslationY.set(e.translationY);
        })
        .onEnd((e) => {
            if (!swipeDirections?.length || !onSwipeDismiss) {
                return;
            }
            const dismissed = dismissedByGesture(e, {x: initialTranslationX.get(), y: initialTranslationY.get()}, swipeThreshold, swipeDirections);
            if (!dismissed) {
                return;
            }
            scheduleOnRN(onSwipeDismiss);
        });

    if (!isEnabled) {
        return children;
    }

    return <GestureDetector gesture={panGesture}>{children}</GestureDetector>;
}

export default SwipeToDismiss;
export {DEFAULT_SWIPE_THRESHOLD_PX};
export type {SwipeToDismissProps};
