import React, {useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {PressableWithoutFeedback} from '@components/Pressable';
import type PressableProps from '@components/Pressable/GenericPressable/types';

/**
 * This component is a workaround to resolve an issue for an Android issue where onPress does not trigger on Mapbox.MapView due to a PanResponder that captures touch events.
 * Related issue: https://github.com/Expensify/App/issues/56499
 */
function ToggleDistanceUnitButton({onPress, children, ...rest}: PressableProps) {
    const touchStartLocation = useRef<{x: number; y: number} | null>(null);

    const handleTouchStart = (event: GestureResponderEvent) => {
        touchStartLocation.current = {
            x: event.nativeEvent.pageX,
            y: event.nativeEvent.pageY,
        };
    };

    const handleTouchMove = (event: GestureResponderEvent) => {
        if (!touchStartLocation.current) {
            return;
        }
        // Determine if the touch movement exceeds a small threshold (1 pixel in any direction)
        // If movement is detected, treat it as a drag and reset touch tracking
        const dx = Math.abs(event.nativeEvent.pageX - touchStartLocation.current.x);
        const dy = Math.abs(event.nativeEvent.pageY - touchStartLocation.current.y);
        if (dx > 1 || dy > 1) {
            touchStartLocation.current = null;
        }
    };

    const handleTouchEnd = () => {
        if (!touchStartLocation.current) {
            return;
        }
        onPress?.();
        touchStartLocation.current = null;
    };

    return (
        <PressableWithoutFeedback
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {children}
        </PressableWithoutFeedback>
    );
}

export default ToggleDistanceUnitButton;
