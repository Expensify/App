import type {SharedValue} from 'react-native-reanimated';
import {useSharedValue} from 'react-native-reanimated';

/**
 * Chart interaction state structure - compatible with Victory's handleTouch function
 */
type ChartInteractionState = {
    /** Whether interaction (hover/press) is currently active */
    isActive: SharedValue<boolean>;

    /** Index of the matched data point (-1 if none) */
    matchedIndex: SharedValue<number>;

    /** X-axis value and position */
    x: {
        value: SharedValue<number>;
        position: SharedValue<number>;
    };

    /** Y-axis value and position */
    y: {
        y: {
            value: SharedValue<number>;
            position: SharedValue<number>;
        };
    };

    /** Y index for stacked bar charts */
    yIndex: SharedValue<number>;

    /** Raw cursor position */
    cursor: {
        x: SharedValue<number>;
        y: SharedValue<number>;
    };
};

/**
 * Creates shared state for chart interactions (hover, tap, press).
 * Compatible with Victory Native's handleTouch function exposed via actionsRef.
 */
function useChartInteractionState(): {state: ChartInteractionState} {
    const isActiveValue = useSharedValue(false);
    const matchedIndex = useSharedValue(-1);
    const xValue = useSharedValue(0);
    const xPosition = useSharedValue(0);
    const yValue = useSharedValue(0);
    const yPosition = useSharedValue(0);
    const yIndex = useSharedValue(-1);
    const cursorX = useSharedValue(0);
    const cursorY = useSharedValue(0);

    const state: ChartInteractionState = {
        isActive: isActiveValue,
        matchedIndex,
        x: {
            value: xValue,
            position: xPosition,
        },
        y: {
            y: {
                value: yValue,
                position: yPosition,
            },
        },
        yIndex,
        cursor: {
            x: cursorX,
            y: cursorY,
        },
    };

    return {state};
}

export {useChartInteractionState};
export type {ChartInteractionState};
