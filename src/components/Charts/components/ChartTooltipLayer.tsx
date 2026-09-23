import {useTooltipData} from '@components/Charts/hooks';
import type {ChartDataPoint, ChartSeries, ChartTooltipPlacement} from '@components/Charts/types';

import type {DerivedValue, SharedValue} from 'react-native-reanimated';

import React, {useState} from 'react';
import Animated, {useAnimatedReaction, useAnimatedStyle} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import ChartTooltip from './ChartTooltip';

type ChartTooltipLayerProps = {
    matchedIndex: SharedValue<number>;

    /** DerivedValue that is true when the tooltip should be visible */
    isTooltipActive: DerivedValue<boolean>;

    /** Chart data points used to compute tooltip content */
    data: ChartDataPoint[];

    /** The plotted series, which the tooltip reads one row per */
    series: ChartSeries[];

    /** Formats a numeric value for display */
    formatValue: (value: number) => string;

    /** The width of the chart container */
    chartWidth: number;

    /** The initial tooltip position (x, y) in canvas coordinates */
    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Where the tooltip sits relative to `initialTooltipPosition`. Defaults to `above`. */
    placement?: ChartTooltipPlacement;
};

/**
 * Renders the chart tooltip in an isolated subtree so that hover-driven state changes
 * (active index, visibility) only re-render this lightweight component, not the chart itself.
 */
function ChartTooltipLayer({matchedIndex, isTooltipActive, data, series, formatValue, chartWidth, initialTooltipPosition, placement}: ChartTooltipLayerProps) {
    const [activeDataIndex, setActiveDataIndex] = useState(-1);

    useAnimatedReaction(
        () => matchedIndex.get(),
        (idx) => {
            scheduleOnRN(setActiveDataIndex, idx);
        },
    );

    const wrapperStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: isTooltipActive.get() ? 1 : 0,
    }));

    const tooltipData = useTooltipData(activeDataIndex, data, series, formatValue);

    if (!tooltipData) {
        return null;
    }

    return (
        <Animated.View
            style={wrapperStyle}
            pointerEvents="none"
        >
            <ChartTooltip
                title={tooltipData.title}
                rows={tooltipData.rows}
                chartWidth={chartWidth}
                initialTooltipPosition={initialTooltipPosition}
                placement={placement}
            />
        </Animated.View>
    );
}

export default ChartTooltipLayer;
