import type {PropsWithChildren} from 'react';
import React, {useMemo} from 'react';
import type {GestureStateChangeEvent, GestureType, PanGestureHandlerEventPayload} from 'react-native-gesture-handler';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import type {GestureHandlerProps, SwipeDirection} from '@components/Modal/ReanimatedModal/types';
import CONST from '@src/CONST';

function hasSwipeEnded(
    e: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    initialPosition: {x: number; y: number},
    swipeThreshold: number,
    swipeDirection?: SwipeDirection | SwipeDirection[],
    onSwipeComplete?: () => void,
) {
    'worklet';

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!swipeDirection || !swipeDirection?.length || !onSwipeComplete) {
        return;
    }
    const directions = Array.isArray(swipeDirection) ? swipeDirection : [swipeDirection];

    for (const direction of directions) {
        switch (direction) {
            case CONST.SWIPE_DIRECTION.RIGHT:
                if (e.translationX - initialPosition.x > swipeThreshold) {
                    scheduleOnRN(onSwipeComplete);
                }
                break;
            case CONST.SWIPE_DIRECTION.LEFT:
                if (initialPosition.x - e.translationX > swipeThreshold) {
                    scheduleOnRN(onSwipeComplete);
                }
                break;
            case CONST.SWIPE_DIRECTION.UP:
                if (initialPosition.y - e.translationY > swipeThreshold) {
                    scheduleOnRN(onSwipeComplete);
                }
                break;
            case CONST.SWIPE_DIRECTION.DOWN:
                if (e.translationY - initialPosition.y > swipeThreshold) {
                    scheduleOnRN(onSwipeComplete);
                }
                break;
            default:
                throw new Error('Unknown swipe direction');
        }
    }
}

function GestureHandler({swipeDirection, onSwipeComplete, swipeThreshold = 100, children}: PropsWithChildren<GestureHandlerProps>) {
    const initialTranslationX = useSharedValue(0);
    const initialTranslationY = useSharedValue(0);
    const panGesture: GestureType = useMemo(
        () =>
            Gesture.Pan()
                .onStart((e) => {
                    initialTranslationX.set(e.translationX);
                    initialTranslationY.set(e.translationY);
                })
                .onEnd((e) => {
                    hasSwipeEnded(e, {x: initialTranslationX.get(), y: initialTranslationY.get()}, swipeThreshold, swipeDirection, onSwipeComplete);
                }),
        [initialTranslationX, initialTranslationY, onSwipeComplete, swipeDirection, swipeThreshold],
    );

    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!swipeDirection || !swipeDirection?.length || !onSwipeComplete) {
        return children;
    }

    return <GestureDetector gesture={panGesture}>{children}</GestureDetector>;
}

export default GestureHandler;
