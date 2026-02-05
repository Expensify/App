import {useMemo, useRef, useState} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import type {SharedValue} from 'react-native-reanimated';
import {useAnimatedReaction, useAnimatedStyle, useDerivedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {TOOLTIP_BAR_GAP} from '@components/Charts/constants';
import {useChartInteractionState} from './useChartInteractionState';

/**
 * Arguments passed to the checkIsOver callback for hit-testing
 */
type HitTestArgs = {
    /** Current raw X position of the cursor */
    cursorX: number;
    /** Current raw Y position of the cursor */
    cursorY: number;
    /** Calculated X position of the matched data point */
    targetX: number;
    /** Calculated Y position of the matched data point */
    targetY: number;
    /** The bottom boundary of the chart area */
    chartBottom: number;
};

/**
 * Configuration for the chart interactions hook
 */
type UseChartInteractionsProps = {
    /** Callback triggered when a valid data point is tapped/clicked */
    handlePress: (index: number) => void;
    /**
     * Worklet function to determine if the cursor is technically "hovering"
     * over a specific chart element (e.g., within a bar's width or a point's radius).
     */
    checkIsOver: (args: HitTestArgs) => boolean;
    /** Optional shared value containing bar dimensions used for hit-testing in bar charts */
    barGeometry?: SharedValue<{barWidth: number; chartBottom: number; yZero: number}>;
};

/**
 * Type for Victory's actionsRef handle.
 * Used to manually trigger Victory's internal touch handling logic.
 */
type CartesianActionsHandle = {
    handleTouch: (state: unknown, x: number, y: number) => void;
};

/**
 * Hook to manage complex chart interactions including hover gestures (web),
 * tap gestures (mobile/web), hit-testing, and animated tooltip positioning.
 *
 * It synchronizes high-frequency interaction data from the UI thread to React state
 * for metadata display (like tooltips) and navigation.
 *
 * @param props - Configuration including press handlers and hit-test logic.
 * @returns An object containing refs, gestures, and state for the chart component.
 *
 * @example
 * ```tsx
 * const { actionsRef, customGestures, activeDataIndex, isTooltipActive, tooltipStyle } = useChartInteractions({
 * handlePress: (index) => console.log("Pressed index:", index),
 * checkIsOver: ({ cursorX, targetX, barWidth }) => {
 * 'worklet';
 * return Math.abs(cursorX - targetX) < barWidth / 2;
 * },
 * barGeometry: myBarSharedValue,
 * });
 *
 * return (
 * <View>
 * <CartesianChart customGestures={customGestures} actionsRef={actionsRef} ... />
 * {isTooltipActive && <Animated.View style={tooltipStyle}><Tooltip index={activeDataIndex} /></Animated.View>}
 * </View>
 * );
 * ```
 */
function useChartInteractions({handlePress, checkIsOver, barGeometry}: UseChartInteractionsProps) {
    /** Interaction state compatible with Victory Native's internal logic */
    const {state: chartInteractionState, isActive: isTooltipActiveState} = useChartInteractionState({x: 0, y: {y: 0}});

    /** Ref passed to CartesianChart to allow manual touch injection */
    const actionsRef = useRef<CartesianActionsHandle>(null);

    /** React state for the index of the point currently being interacted with */
    const [activeDataIndex, setActiveDataIndex] = useState(-1);

    /** React state indicating if the cursor is currently "hitting" a target based on checkIsOver */
    const [isOverTarget, setIsOverTarget] = useState(false);

    /**
     * Derived value performing the hit-test on the UI thread.
     * Runs whenever cursor position or matched data points change.
     */
    const isCursorOverTarget = useDerivedValue(() => {
        const cursorX = chartInteractionState.cursor.x.get();
        const cursorY = chartInteractionState.cursor.y.get();
        const targetX = chartInteractionState.x.position.get();
        const targetY = chartInteractionState.y.y.position.get();

        const chartBottom = barGeometry?.get().chartBottom ?? 0;

        return checkIsOver({
            cursorX,
            cursorY,
            targetX,
            targetY,
            chartBottom,
        });
    });

    /** Syncs the matched data index from the UI thread to React state */
    useAnimatedReaction(
        () => chartInteractionState.matchedIndex.get(),
        (currentIndex) => {
            scheduleOnRN(setActiveDataIndex, currentIndex);
        },
    );

    /** Syncs the hit-test result from the UI thread to React state */
    useAnimatedReaction(
        () => isCursorOverTarget.get(),
        (isOver) => {
            scheduleOnRN(setIsOverTarget, isOver);
        },
    );

    /**
     * Hover gesture configuration.
     * Primarily used for web/desktop to track mouse movement without clicking.
     */
    const hoverGesture = useMemo(
        () =>
            Gesture.Hover()
                .onBegin((e) => {
                    'worklet';

                    chartInteractionState.isActive.set(true);
                    chartInteractionState.cursor.x.set(e.x);
                    chartInteractionState.cursor.y.set(e.y);
                    actionsRef.current?.handleTouch(chartInteractionState, e.x, e.y);
                })
                .onUpdate((e) => {
                    'worklet';

                    chartInteractionState.cursor.x.set(e.x);
                    chartInteractionState.cursor.y.set(e.y);
                    actionsRef.current?.handleTouch(chartInteractionState, e.x, e.y);
                })
                .onEnd(() => {
                    'worklet';

                    chartInteractionState.isActive.set(false);
                }),
        [chartInteractionState],
    );

    /**
     * Tap gesture configuration.
     * Handles clicks/touches and triggers handlePress if Victory matched a data point.
     */
    const tapGesture = useMemo(
        () =>
            Gesture.Tap().onEnd((e) => {
                'worklet';

                // Update cursor position
                chartInteractionState.cursor.x.set(e.x);
                chartInteractionState.cursor.y.set(e.y);

                // Let Victory calculate which data point was tapped
                actionsRef.current?.handleTouch(chartInteractionState, e.x, e.y);
                const matchedIndex = chartInteractionState.matchedIndex.get();

                // If Victory matched a valid data point, trigger the press handler
                if (matchedIndex >= 0) {
                    scheduleOnRN(handlePress, matchedIndex);
                }
            }),
        [chartInteractionState, handlePress],
    );

    /** Combined gesture object to be passed to CartesianChart's customGestures prop */
    const customGestures = useMemo(() => Gesture.Race(hoverGesture, tapGesture), [hoverGesture, tapGesture]);

    /**
     * Animated style for positioning a tooltip relative to the matched data point.
     * Automatically applies vertical offset and centering.
     * For negative bars, positions tooltip at yZero (top of bar) instead of targetY (bottom of bar).
     */
    const tooltipStyle = useAnimatedStyle(() => {
        const targetY = chartInteractionState.y.y.position.get();
        const yZero = barGeometry?.get().yZero ?? targetY;
        // Position tooltip at the top of the bar (min of targetY and yZero)
        const barTopY = Math.min(targetY, yZero);

        return {
            position: 'absolute',
            left: chartInteractionState.x.position.get(),
            top: barTopY - TOOLTIP_BAR_GAP,
            transform: [{translateX: '-50%'}, {translateY: '-100%'}],
            opacity: chartInteractionState.isActive.get() ? 1 : 0,
        };
    });

    return {
        /** Ref to be passed to CartesianChart */
        actionsRef,
        /** Gestures to be passed to CartesianChart */
        customGestures,
        /** The currently active data index (React state) */
        activeDataIndex,
        /** Whether the tooltip should currently be rendered and visible */
        isTooltipActive: isOverTarget && isTooltipActiveState,
        /** Animated styles for the tooltip container */
        tooltipStyle,
    };
}

export {useChartInteractions};
export type {HitTestArgs};
