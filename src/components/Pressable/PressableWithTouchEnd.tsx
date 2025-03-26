import React, {useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';
import CONST from '@src/CONST';
import type PressableProps from './GenericPressable/types';
import PressableWithoutFeedback from './PressableWithoutFeedback';

/**
 * This component is a workaround to resolve an issue on Android where onPress does not trigger.
 * Related issue: https://github.com/Expensify/App/issues/56499
 * Please do not use this elsewhere unless you fully understand the context.
 */
function PressableWithTouchEnd({onPress, children, ...rest}: PressableProps) {
    const touchStartTime = useRef<number | null>(null);
    const touchStartLocation = useRef<{x: number; y: number} | null>(null);

    const handleTouchStart = (event: GestureResponderEvent) => {
        touchStartTime.current = Date.now();
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
            touchStartTime.current = null;
            touchStartLocation.current = null;
        }
    };

    const handleTouchEnd = () => {
        // Only trigger onPress if this was a quick tap (less than PRESS_HOLD_DURATION_MS ms),
        // as anything longer should be considered a long press.
        if (touchStartTime.current && Date.now() - touchStartTime.current < CONST.PRESS_HOLD_DURATION_MS) {
            onPress?.();
        }
        touchStartTime.current = null;
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

PressableWithTouchEnd.displayName = 'PressableWithTouchEnd';

export default PressableWithTouchEnd;
