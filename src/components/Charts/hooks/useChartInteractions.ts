import type {SharedValue} from 'react-native-reanimated';

import {useCallback} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import useChartInteractionState from './useChartInteractionState';

/** Gap between bar top and tooltip bottom */
const TOOLTIP_BAR_GAP = 8;

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

    /** The index of the matched target */
    targetIndex: number;
};

/**
 * Arguments passed to the resolveTargetIndex callback for custom target matching
 */
type ResolveTargetIndexArgs = {
    /** Current raw X position of the cursor */
    cursorX: number;

    /** Current raw Y position of the cursor */
    cursorY: number;

    /** X position used for nearest-point matching after any label-area correction */
    touchX: number;

    /** Canvas-space X positions for each target */
    pointX: number[];

    /** Canvas-space Y positions for each target */
    pointY: number[];

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

    /**
     * Optional worklet function to determine if the cursor is over a clickable target.
     * Defaults to checkIsOver when omitted.
     */
    checkIsClickable?: (args: HitTestArgs) => boolean;

    /**
     * Optional worklet function to resolve the matched target index.
     * Defaults to nearest-point-by-X matching.
     */
    resolveTargetIndex?: (args: ResolveTargetIndexArgs) => number;

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
};

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
function useChartInteractions({handlePress, checkIsOver, checkIsClickable, resolveTargetIndex, isCursorOverLabel, resolveLabelTouchX, chartBottom, yZero}: UseChartInteractionsProps) {
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
    const isCursorOverTarget = useSharedValue(false);
    const isCursorOverClickable = useSharedValue(false);
    const isTooltipActive = useSharedValue(false);

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

    const getHitTestArgs = (targetIndex: number, cursorX: number, cursorY: number, targetX: number, targetY: number, currentChartBottom: number): HitTestArgs => {
        'worklet';

        return {
            cursorX,
            cursorY,
            targetX,
            targetY,
            chartBottom: currentChartBottom,
            targetIndex,
        };
    };

    const getCurrentHitTestArgs = () => {
        'worklet';

        const targetIndex = chartInteractionState.matchedIndex.get();
        if (targetIndex < 0) {
            return;
        }

        const cursorX = chartInteractionState.cursor.x.get();
        const cursorY = chartInteractionState.cursor.y.get();
        const targetX = chartInteractionState.x.position.get();
        const targetY = chartInteractionState.y.y.position.get();
        const currentChartBottom = chartBottom?.get() ?? 0;
        return getHitTestArgs(targetIndex, cursorX, cursorY, targetX, targetY, currentChartBottom);
    };

    const getResolvedTargetIndex = (cursorX: number, cursorY: number, touchX: number) => {
        'worklet';

        const ox = pointOX.get();
        const oy = pointOY.get();
        const currentChartBottom = chartBottom?.get() ?? 0;
        return (
            resolveTargetIndex?.({
                cursorX,
                cursorY,
                touchX,
                pointX: ox,
                pointY: oy,
                chartBottom: currentChartBottom,
            }) ?? findClosestPoint(ox, touchX)
        );
    };

    const applyTargetIndex = (targetIndex: number) => {
        'worklet';

        chartInteractionState.matchedIndex.set(targetIndex);
        if (targetIndex < 0) {
            return;
        }

        const ox = pointOX.get();
        const oy = pointOY.get();
        chartInteractionState.x.position.set(ox.at(targetIndex) ?? 0);
        chartInteractionState.x.value.set(targetIndex);
        chartInteractionState.y.y.position.set(oy.at(targetIndex) ?? 0);
    };

    const updateInteractionFlags = (targetIndex: number, cursorX: number, cursorY: number, currentChartBottom: number) => {
        'worklet';

        const ox = pointOX.get();
        const oy = pointOY.get();
        const targetX = targetIndex >= 0 ? ox.at(targetIndex) : undefined;
        const targetY = targetIndex >= 0 ? oy.at(targetIndex) : undefined;
        if (targetX === undefined || targetY === undefined) {
            isCursorOverTarget.set(false);
            isCursorOverClickable.set(false);
            isTooltipActive.set(false);
            return false;
        }

        const hitTestArgs = getHitTestArgs(targetIndex, cursorX, cursorY, targetX, targetY, currentChartBottom);
        const isOverTarget = checkIsOver(hitTestArgs) || (isCursorOverLabel?.(hitTestArgs, targetIndex) ?? false);
        const isOverClickableElement = (checkIsClickable ?? checkIsOver)(hitTestArgs);

        isCursorOverTarget.set(isOverTarget);
        isCursorOverClickable.set(isOverClickableElement);
        isTooltipActive.set(isOverTarget && chartInteractionState.isActive.get());

        return isOverTarget;
    };

    const updateCurrentInteractionFlags = () => {
        'worklet';

        const hitTestArgs = getCurrentHitTestArgs();
        if (!hitTestArgs) {
            isCursorOverTarget.set(false);
            isCursorOverClickable.set(false);
            isTooltipActive.set(false);
            return false;
        }

        return updateInteractionFlags(hitTestArgs.targetIndex, hitTestArgs.cursorX, hitTestArgs.cursorY, hitTestArgs.chartBottom);
    };

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
                const bottom = chartBottom?.get() ?? e.y;
                const touchX = e.y >= bottom && resolveLabelTouchX ? resolveLabelTouchX(e.x, e.y) : e.x;
                const targetIndex = getResolvedTargetIndex(e.x, e.y, touchX);
                applyTargetIndex(targetIndex);
                updateInteractionFlags(targetIndex, e.x, e.y, bottom);
            })
            .onUpdate((e) => {
                'worklet';

                chartInteractionState.cursor.x.set(e.x);
                chartInteractionState.cursor.y.set(e.y);
                const bottom = chartBottom?.get() ?? e.y;
                const isOverCurrentTarget = updateCurrentInteractionFlags();
                // Only update the matched index when the cursor is not over the current target.
                // This keeps the active index locked while hovering over a bar/point/label,
                // preventing it from jumping to a different point during continuous movement.
                if (!isOverCurrentTarget) {
                    const touchX = e.y >= bottom && resolveLabelTouchX ? resolveLabelTouchX(e.x, e.y) : e.x;
                    const targetIndex = getResolvedTargetIndex(e.x, e.y, touchX);
                    applyTargetIndex(targetIndex);
                    updateInteractionFlags(targetIndex, e.x, e.y, bottom);
                }
            })
            .onEnd(() => {
                'worklet';

                chartInteractionState.isActive.set(false);
                isCursorOverTarget.set(false);
                isCursorOverClickable.set(false);
                isTooltipActive.set(false);
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
            const idx = getResolvedTargetIndex(e.x, e.y, e.x);
            applyTargetIndex(idx);
            if (idx < 0) {
                return;
            }
            const targetX = ox.at(idx) ?? 0;
            const targetY = oy.at(idx) ?? 0;
            const currentChartBottom = chartBottom?.get() ?? 0;
            const hitTestArgs = getHitTestArgs(idx, e.x, e.y, targetX, targetY, currentChartBottom);
            const isClickable = (checkIsClickable ?? checkIsOver)(hitTestArgs);
            updateInteractionFlags(idx, e.x, e.y, currentChartBottom);
            if (isClickable) {
                scheduleOnRN(handlePress, idx);
            }
        });

    /**
     * Raw tooltip positioning data.
     * We return these as individual derived values so the caller can
     * compose them into their own useAnimatedStyle.
     */
    const initialTooltipPosition = useDerivedValue(() => {
        const targetY = chartInteractionState.y.y.position.get();
        const currentYZero = yZero?.get() ?? targetY;
        // Position tooltip at the top of the bar (min of targetY and yZero)
        const barTopY = Math.min(targetY, currentYZero);

        return {
            x: chartInteractionState.x.position.get(),
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
        /** SharedValue that is true when the tooltip should be visible */
        isTooltipActive,
        /** SharedValue that is true when the cursor is over a clickable element (dot/bar, not label) */
        isCursorOverClickable,
        /** Raw tooltip positioning data */
        initialTooltipPosition,
    };
}

export {useChartInteractions, findClosestPoint, TOOLTIP_BAR_GAP};
export type {HitTestArgs, ResolveTargetIndexArgs};
