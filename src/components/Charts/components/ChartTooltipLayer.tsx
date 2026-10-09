import {useTooltipData} from '@components/Charts/hooks';
import type {ChartDataPoint} from '@components/Charts/types';

import type {DerivedValue, SharedValue} from 'react-native-reanimated';

import React, {useLayoutEffect, useState} from 'react';
import {useAnimatedReaction, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import ChartTooltip from './ChartTooltip';

type ChartTooltipLayerProps = {
    matchedIndex: SharedValue<number>;

    /** DerivedValue that is true when the tooltip should be visible */
    isTooltipActive: DerivedValue<boolean>;

    /** Chart data points used to compute tooltip content */
    data: ChartDataPoint[];

    /** Formats a numeric value for display */
    formatValue: (value: number) => string;

    /** The width of the chart container */
    chartWidth: number;

    /** The initial tooltip position (x, y) in canvas coordinates */
    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Called with how far the chart moved in the window while the tooltip is shown */
    onChartMoved?: (deltaX: number, deltaY: number) => void;

    /** Hides a tooltip pinned by a touch tap, passed only while it is pinned */
    onDismiss?: () => void;
};

/**
 * Renders the chart tooltip in an isolated subtree so that hover-driven state changes
 * (active index, visibility) only re-render this lightweight component, not the chart itself.
 */
function ChartTooltipLayer({matchedIndex, isTooltipActive, data, formatValue, chartWidth, initialTooltipPosition, onChartMoved, onDismiss}: ChartTooltipLayerProps) {
    const [activeDataIndex, setActiveDataIndex] = useState(-1);

    useAnimatedReaction(
        () => matchedIndex.get(),
        (idx) => {
            scheduleOnRN(setActiveDataIndex, idx);
        },
    );

    // The target changes on the UI thread a frame before its content renders, so the tooltip stays hidden until both match
    const renderedIndex = useSharedValue(-1);
    useLayoutEffect(() => {
        renderedIndex.set(activeDataIndex);
    }, [activeDataIndex, renderedIndex]);
    const isContentCurrent = useDerivedValue(() => matchedIndex.get() === renderedIndex.get());

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

    if (!tooltipData) {
        return null;
    }

    return (
        <ChartTooltip
            label={tooltipData.label}
            amount={tooltipData.amount}
            percentage={tooltipData.percentage}
            expenseCount={tooltipData.expenseCount}
            chartWidth={chartWidth}
            initialTooltipPosition={initialTooltipPosition}
            isVisible={isTooltipActive}
            isContentCurrent={isContentCurrent}
            onChartMoved={onChartMoved}
            onDismiss={onDismiss}
        />
    );
}

export default ChartTooltipLayer;
