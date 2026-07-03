import type {SharedValue} from 'react-native-reanimated';

import {useCallback} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import useChartInteractionState from './useChartInteractionState';

/** Gap between bar top and tooltip bottom */
const TOOLTIP_BAR_GAP = 8;

/** X position for a tooltip placed to the right of a horizontal bar end. */
function getRightTooltipAnchorX(targetX: number): number {
    return targetX + TOOLTIP_BAR_GAP;
}

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

    /** Worklet function to determine if the cursor is hovering over the label area */
    isCursorOverLabel?: (args: HitTestArgs, activeIndex: number) => boolean;

    /**
     * Optional worklet that, when the cursor is in the label area, scans all label bounding
     * boxes and returns the tick X of the label the cursor is inside (or the raw cursor X if
     * no label matches). Used to correct Victory's nearest-point-by-X algorithm for rotated
     * labels whose bounding boxes extend past the midpoint between adjacent ticks.
     */
    resolveLabelTouchX?: (cursorX: number, cursorY: number) => number;

    /** Optional shared value containing bar dimensions used for hit-testing in bar charts */
    chartBottom?: SharedValue<number>;

    /** Optional shared value containing the y-axis zero position */
    yZero?: SharedValue<number>;

    /** Axis used to resolve the nearest data point on hover/tap. Defaults to x (vertical bar charts). */
    nearestPointAxis?: 'x' | 'y';

    /** Tooltip anchor relative to the data point. */
    tooltipPlacement?: 'above' | 'right';
};

/**
 * Finds the index of the closest value in an array that may be ascending or descending.
 * Used for horizontal bar charts where category Y positions are not guaranteed ascending.
 */
function findClosestPointAnyOrder(values: number[], target: number): number {
    'worklet';

    const n = values.length;
    if (n === 0) {
        return -1;
    }

    let closestIndex = 0;
    let closestDistance = Math.abs((values.at(0) ?? 0) - target);

    for (let i = 1; i < n; i++) {
        const distance = Math.abs((values.at(i) ?? 0) - target);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = i;
        }
    }

    return closestIndex;
}

/**
 * Binary search over canvas x positions to find the index of the closest data point.
 * Equivalent to victory-native's internal findClosestPoint utility.
 */
function findClosestPoint(xValues: number[], targetX: number): number {
    'worklet';

    const n = xValues.length;
    if (n === 0) {
        return -1;
    }
    if (targetX <= (xValues.at(0) ?? 0)) {
        return 0;
    }
    if (targetX >= (xValues.at(-1) ?? 0)) {
        return n - 1;
    }
    let lo = 0;
    let hi = n;
    let mid = 0;
    while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        const midVal = xValues.at(mid) ?? 0;
        if (midVal === targetX) {
            return mid;
        }
        if (targetX < midVal) {
            if (mid > 0 && targetX > (xValues.at(mid - 1) ?? 0)) {
                const prevVal = xValues.at(mid - 1) ?? 0;
                return targetX - prevVal >= midVal - targetX ? mid : mid - 1;
            }
            hi = mid;
        } else {
            if (mid < n - 1 && targetX < (xValues.at(mid + 1) ?? 0)) {
                const nextVal = xValues.at(mid + 1) ?? 0;
                return targetX - midVal >= nextVal - targetX ? mid + 1 : mid;
            }
            lo = mid + 1;
        }
    }
    return mid;
}

/**
 * Manages chart interactions (hover, tap, hit-testing) and animated tooltip positioning.
 * Uses react native gesture handler gestures directly — no dependency on Victory's actionsRef/handleTouch.
 * Synchronizes high-frequency UI thread data to React state for tooltip display and navigation.
 */
function useChartInteractions({
    handlePress,
    checkIsOver,
    isCursorOverLabel,
    resolveLabelTouchX,
    chartBottom,
    yZero,
    nearestPointAxis = 'x',
    tooltipPlacement = 'above',
}: UseChartInteractionsProps) {
    /** Interaction state compatible with Victory Native's internal logic */
    const {state: chartInteractionState} = useChartInteractionState();

    /**
     * Canvas-space x positions for each data point, set by the chart content via setPointPositions.
     * These replace Victory's internal tData.ox array, enabling worklet-safe nearest-point lookup.
     */
    const pointOX = useSharedValue<number[]>([]);

    /**
     * Canvas-space y positions for each data point, set by the chart content via setPointPositions.
     */
    const pointOY = useSharedValue<number[]>([]);

    /**
     * Called by chart content from handleScaleChange to populate canvas positions.
     * Must be called with the positions derived from the current d3 scale.
     */
    const setPointPositions = useCallback(
        (ox: number[], oy: number[]) => {
            pointOX.set(ox);
            pointOY.set(oy);
        },
        [pointOX, pointOY],
    );

    const getNearestIndex = (cursorX: number, cursorY: number) => {
        'worklet';

        const positions = nearestPointAxis === 'y' ? pointOY.get() : pointOX.get();
        const coordinate = nearestPointAxis === 'y' ? cursorY : cursorX;
        return nearestPointAxis === 'y' ? findClosestPointAnyOrder(positions, coordinate) : findClosestPoint(positions, coordinate);
    };

    const syncMatchedIndex = (idx: number) => {
        'worklet';

        const ox = pointOX.get();
        const oy = pointOY.get();
        chartInteractionState.matchedIndex.set(idx);
        chartInteractionState.x.position.set(ox.at(idx) ?? 0);
        chartInteractionState.x.value.set(idx);
        chartInteractionState.y.y.position.set(oy.at(idx) ?? 0);
    };

    /**
     * Derived value that checks only whether the cursor is over a clickable element
     * (e.g. dot, bar) — excludes labels which show tooltip but aren't clickable.
     */
    const isCursorOverClickable = useDerivedValue(() => {
        const cursorX = chartInteractionState.cursor.x.get();
        const cursorY = chartInteractionState.cursor.y.get();
        const targetX = chartInteractionState.x.position.get();
        const targetY = chartInteractionState.y.y.position.get();
        const currentChartBottom = chartBottom?.get() ?? 0;
        return checkIsOver({
            cursorX,
            cursorY,
            targetX,
            targetY,
            chartBottom: currentChartBottom,
        });
    });

    /**
     * Derived value performing the hit-test on the UI thread.
     * Runs whenever cursor position or matched data points change.
     * Includes both clickable targets and labels (for tooltip display).
     */
    const isCursorOverTarget = useDerivedValue(() => {
        if (isCursorOverClickable.get()) {
            return true;
        }
        const cursorX = chartInteractionState.cursor.x.get();
        const cursorY = chartInteractionState.cursor.y.get();
        const targetX = chartInteractionState.x.position.get();
        const targetY = chartInteractionState.y.y.position.get();
        const currentChartBottom = chartBottom?.get() ?? 0;
        return isCursorOverLabel?.({cursorX, cursorY, targetX, targetY, chartBottom: currentChartBottom}, chartInteractionState.matchedIndex.get()) ?? false;
    });

    /**
     * Derived value that combines hover active state with hit-test result.
     * Drives tooltip visibility entirely on the UI thread — no React state needed.
     */
    const isTooltipActive = useDerivedValue(() => isCursorOverTarget.get() && chartInteractionState.isActive.get());

    /**
     * Hover gesture to be placed on the full-height outer container (chart + label area).
     * Clamps the y coordinate to chartBottom before passing to Victory so that hovering
     * over x-axis labels below the plot area still resolves the nearest data point.
     * This gesture is returned separately and must NOT be passed to CartesianChart's
     * customGestures prop, because Victory's internal GestureHandler view only covers
     * the plot area and would drop events from the label area.
     */
    const hoverGesture = () =>
        Gesture.Hover()
            .onBegin((e) => {
                'worklet';

                chartInteractionState.isActive.set(true);
                chartInteractionState.cursor.x.set(e.x);
                chartInteractionState.cursor.y.set(e.y);
                if (nearestPointAxis === 'y') {
                    const idx = getNearestIndex(e.x, e.y);
                    if (idx >= 0) {
                        syncMatchedIndex(idx);
                    }
                } else {
                    const bottom = chartBottom?.get() ?? e.y;
                    const touchX = e.y >= bottom && resolveLabelTouchX ? resolveLabelTouchX(e.x, e.y) : e.x;
                    const ox = pointOX.get();
                    const idx = findClosestPoint(ox, touchX);
                    if (idx >= 0) {
                        syncMatchedIndex(idx);
                    }
                }
            })
            .onUpdate((e) => {
                'worklet';

                chartInteractionState.cursor.x.set(e.x);
                chartInteractionState.cursor.y.set(e.y);
                // Only update the matched index when the cursor is not over the current target.
                // This keeps the active index locked while hovering over a bar/point/label,
                // preventing it from jumping to a different point during continuous movement.
                if (!isCursorOverTarget.get()) {
                    if (nearestPointAxis === 'y') {
                        const idx = getNearestIndex(e.x, e.y);
                        if (idx >= 0) {
                            syncMatchedIndex(idx);
                        }
                    } else {
                        const bottom = chartBottom?.get() ?? e.y;
                        const touchX = e.y >= bottom && resolveLabelTouchX ? resolveLabelTouchX(e.x, e.y) : e.x;
                        const ox = pointOX.get();
                        const idx = findClosestPoint(ox, touchX);
                        if (idx >= 0) {
                            syncMatchedIndex(idx);
                        }
                    }
                }
            })
            .onEnd(() => {
                'worklet';

                chartInteractionState.isActive.set(false);
            });

    /**
     * Tap gesture. Resolves the nearest data point entirely on the UI thread,
     * then schedules handlePress on the JS thread if the cursor is over the target.
     */
    const tapGesture = () =>
        Gesture.Tap().onEnd((e) => {
            'worklet';

            chartInteractionState.cursor.x.set(e.x);
            chartInteractionState.cursor.y.set(e.y);
            const ox = pointOX.get();
            const oy = pointOY.get();
            const idx = nearestPointAxis === 'y' ? findClosestPointAnyOrder(oy, e.y) : findClosestPoint(ox, e.x);
            if (idx < 0) {
                return;
            }
            const targetX = ox.at(idx) ?? 0;
            const targetY = oy.at(idx) ?? 0;
            chartInteractionState.matchedIndex.set(idx);
            chartInteractionState.x.position.set(targetX);
            chartInteractionState.x.value.set(idx);
            chartInteractionState.y.y.position.set(targetY);
            const currentChartBottom = chartBottom?.get() ?? 0;
            if (
                checkIsOver({
                    cursorX: e.x,
                    cursorY: e.y,
                    targetX,
                    targetY,
                    chartBottom: currentChartBottom,
                })
            ) {
                scheduleOnRN(handlePress, idx);
            }
        });

    /**
     * Raw tooltip positioning data.
     * We return these as individual derived values so the caller can
     * compose them into their own useAnimatedStyle.
     */
    const initialTooltipPosition = useDerivedValue(() => {
        const targetX = chartInteractionState.x.position.get();
        const targetY = chartInteractionState.y.y.position.get();

        if (tooltipPlacement === 'right') {
            return {
                x: getRightTooltipAnchorX(targetX),
                y: targetY,
            };
        }

        const currentYZero = yZero?.get() ?? targetY;
        const barTopY = Math.min(targetY, currentYZero);

        return {
            x: targetX,
            y: barTopY - TOOLTIP_BAR_GAP,
        };
    });

    const customGestures = Gesture.Race(hoverGesture(), tapGesture());

    return {
        /** Custom gestures to be passed to CartesianChart */
        customGestures,
        /**
         * Call this from handleScaleChange with the canvas x/y positions of each data point.
         * Derived from the d3 scale: ox[i] = xScale(i), oy[i] = yScale(data[i].total).
         */
        setPointPositions,
        /** SharedValue for the currently matched data index — read on the UI thread or sync via useAnimatedReaction */
        matchedIndex: chartInteractionState.matchedIndex,
        /** DerivedValue that is true when the tooltip should be visible */
        isTooltipActive,
        /** DerivedValue that is true when the cursor is over a clickable element (dot/bar, not label) */
        isCursorOverClickable,
        /** Raw tooltip positioning data */
        initialTooltipPosition,
        /** Tooltip placement for the overlay layer */
        tooltipPlacement,
    };
}

export {useChartInteractions, findClosestPoint, findClosestPointAnyOrder, getRightTooltipAnchorX, TOOLTIP_BAR_GAP};
export type {HitTestArgs};
