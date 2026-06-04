import React, {useState} from 'react';
import Animated, {useAnimatedReaction, useAnimatedStyle} from 'react-native-reanimated';
import type {DerivedValue, SharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {useTooltipData} from '@components/Charts/hooks';
import type {ChartDataPoint} from '@components/Charts/types';
import ChartTooltip from './ChartTooltip';

type ChartTooltipLayerProps = {
    /** SharedValue for the currently matched data index */
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
};

/**
 * Renders the chart tooltip in an isolated subtree so that hover-driven state changes
 * (active index, visibility) only re-render this lightweight component, not the chart itself.
 */
function ChartTooltipLayer({matchedIndex, isTooltipActive, data, formatValue, chartWidth, initialTooltipPosition}: ChartTooltipLayerProps) {
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

    const tooltipData = useTooltipData(activeDataIndex, data, formatValue);

    if (!tooltipData) {
        return null;
    }

    return (
        <Animated.View
            style={wrapperStyle}
            pointerEvents="none"
        >
            <ChartTooltip
                label={tooltipData.label}
                amount={tooltipData.amount}
                percentage={tooltipData.percentage}
                chartWidth={chartWidth}
                initialTooltipPosition={initialTooltipPosition}
            />
        </Animated.View>
    );
}

export default ChartTooltipLayer;
