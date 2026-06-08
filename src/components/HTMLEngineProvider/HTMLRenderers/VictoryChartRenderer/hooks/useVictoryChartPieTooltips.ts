import {useCallback} from 'react';
import {Gesture} from 'react-native-gesture-handler';
import {useDerivedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks/useChartInteractions';
import useChartInteractionState from '@components/Charts/hooks/useChartInteractionState';
import type {PieSlice} from '@components/Charts/types';
import {findSliceAtPosition} from '@components/Charts/utils';

type PieGeometry = {
    centerX: number;
    centerY: number;
    radius: number;
};

type UseVictoryChartPieTooltipsParams = {
    slices: PieSlice[];
    pieGeometry: PieGeometry;
    innerRadius: number;
    onHoverChange?: (isHovering: boolean) => void;
};

/**
 * Manages hover and tap gestures for VirtualCFO pie chart tooltips.
 */
function useVictoryChartPieTooltips({slices, pieGeometry, innerRadius, onHoverChange}: UseVictoryChartPieTooltipsParams) {
    const {state: chartInteractionState} = useChartInteractionState();

    const applySliceIndex = useCallback(
        (sliceIndex: number) => {
            if (sliceIndex < 0) {
                chartInteractionState.matchedIndex.set(-1);
                onHoverChange?.(false);
                return;
            }

            const slice = slices.at(sliceIndex);
            if (!slice) {
                chartInteractionState.matchedIndex.set(-1);
                onHoverChange?.(false);
                return;
            }

            chartInteractionState.matchedIndex.set(slice.originalIndex);
            chartInteractionState.x.position.set(slice.tooltipPosition.x);
            chartInteractionState.x.value.set(slice.originalIndex);
            chartInteractionState.y.y.position.set(slice.tooltipPosition.y);
            onHoverChange?.(true);
        },
        [chartInteractionState, onHoverChange, slices],
    );

    const updateSliceAtCursor = useCallback(
        (cursorX: number, cursorY: number) => {
            const sliceIndex = findSliceAtPosition(cursorX, cursorY, pieGeometry.centerX, pieGeometry.centerY, pieGeometry.radius, innerRadius, slices);
            applySliceIndex(sliceIndex);
        },
        [applySliceIndex, innerRadius, pieGeometry.centerX, pieGeometry.centerY, pieGeometry.radius, slices],
    );

    const clearSlice = useCallback(() => {
        chartInteractionState.matchedIndex.set(-1);
        chartInteractionState.isActive.set(false);
        onHoverChange?.(false);
    }, [chartInteractionState, onHoverChange]);

    const hoverGesture = () =>
        Gesture.Hover()
            .onBegin((event) => {
                'worklet';

                chartInteractionState.isActive.set(true);
                chartInteractionState.cursor.x.set(event.x);
                chartInteractionState.cursor.y.set(event.y);
                scheduleOnRN(updateSliceAtCursor, event.x, event.y);
            })
            .onUpdate((event) => {
                'worklet';

                chartInteractionState.isActive.set(true);
                chartInteractionState.cursor.x.set(event.x);
                chartInteractionState.cursor.y.set(event.y);
                scheduleOnRN(updateSliceAtCursor, event.x, event.y);
            })
            .onEnd(() => {
                'worklet';

                chartInteractionState.isActive.set(false);
                scheduleOnRN(clearSlice);
            });

    const tapGesture = () =>
        Gesture.Tap().onEnd((event) => {
            'worklet';

            chartInteractionState.cursor.x.set(event.x);
            chartInteractionState.cursor.y.set(event.y);
            scheduleOnRN(updateSliceAtCursor, event.x, event.y);
            chartInteractionState.isActive.set(true);
        });

    const isTooltipActive = useDerivedValue(() => chartInteractionState.isActive.get() && chartInteractionState.matchedIndex.get() >= 0);

    const initialTooltipPosition = useDerivedValue(() => ({
        x: chartInteractionState.x.position.get(),
        y: chartInteractionState.y.y.position.get() - TOOLTIP_BAR_GAP,
    }));

    const plotGestures = Gesture.Race(hoverGesture(), tapGesture());

    return {
        plotGestures,
        matchedIndex: chartInteractionState.matchedIndex,
        isTooltipActive,
        initialTooltipPosition,
    };
}

export default useVictoryChartPieTooltips;
