import React, {useRef} from 'react';
import {PanResponder, View} from 'react-native';
import CONST from '@src/CONST';
import SwipeableViewProps from './types';

function SwipeableView({children, onSwipeDown, onSwipeUp}: SwipeableViewProps) {
    const minimumPixelDistance = CONST.COMPOSER_MAX_HEIGHT;
    const oldYRef = useRef(0);
    const directionRef = useRef<'UP' | 'DOWN' | null>(null);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponderCapture: (event, gestureState) => {
                if (gestureState.dy - oldYRef.current > 0 && gestureState.dy > minimumPixelDistance) {
                    directionRef.current = 'DOWN';
                    return true;
                }

                if (gestureState.dy - oldYRef.current < 0 && Math.abs(gestureState.dy) > minimumPixelDistance) {
                    directionRef.current = 'UP';
                    return true;
                }
                oldYRef.current = gestureState.dy;
                return false;
            },

            onPanResponderRelease: () => {
                if (directionRef.current === 'DOWN' && onSwipeDown) {
                    onSwipeDown();
                } else if (directionRef.current === 'UP' && onSwipeUp) {
                    onSwipeUp();
                }
                directionRef.current = null; // Reset the direction after the gesture completes
            },
        }),
    ).current;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <View {...panResponder.panHandlers}>{children}</View>;
}

SwipeableView.displayName = 'SwipeableView';

export default SwipeableView;
