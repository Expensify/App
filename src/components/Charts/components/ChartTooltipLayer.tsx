import {useTooltipData} from '@components/Charts/hooks';
import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';
import formatTooltipComparison from '@components/Charts/utils/formatTooltipComparison';

import useLocalize from '@hooks/useLocalize';

import type {DerivedValue, SharedValue} from 'react-native-reanimated';
import type {NonEmptyTuple} from 'type-fest';

import React, {useState} from 'react';
import {useAnimatedReaction, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import ChartTooltip from './ChartTooltip';
import ChartTooltipComparison from './ChartTooltipComparison';
import ChartTooltipSummary from './ChartTooltipSummary';

type ChartTooltipLayerProps = {
    matchedIndex: SharedValue<number>;

    /** DerivedValue that is true when the tooltip should be visible */
    isTooltipActive: DerivedValue<boolean>;

    /** Chart data points used to compute tooltip content */
    data: ChartDataPoint[];

    /** Chart series used to compute tooltip content */
    series: NonEmptyTuple<ChartSeries>;

    /** Formats a numeric value for display */
    formatValue: (value: number) => string;

    /** The width of the chart container */
    chartWidth: number;

    /** The initial tooltip position (x, y) in canvas coordinates */
    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Called with how far the chart moved in the window while the tooltip is shown */
    onChartMoved?: (deltaX: number, deltaY: number) => void;

    /** Hides the tooltip */
    onDismiss: () => void;

    /** Whether a compared tooltip shows how the primary series changed against the compared one */
    shouldShowTooltipChange?: boolean;
};

/**
 * Renders the chart tooltip in an isolated subtree so that hover-driven state changes
 * (active index, visibility) only re-render this lightweight component, not the chart itself.
 */
function ChartTooltipLayer({
    matchedIndex,
    isTooltipActive,
    data,
    series,
    formatValue,
    chartWidth,
    initialTooltipPosition,
    onChartMoved,
    onDismiss,
    shouldShowTooltipChange = true,
}: ChartTooltipLayerProps) {
    const [activeDataIndex, setActiveDataIndex] = useState(-1);

    // Set from the content's layout, since on native a value set during render can reach the UI thread before the new content is mounted
    const laidOutIndex = useSharedValue(-1);

    useAnimatedReaction(
        () => matchedIndex.get(),
        (idx) => {
            scheduleOnRN(setActiveDataIndex, idx);
        },
    );

    const {preferredLocale} = useLocalize();
    const isContentCurrent = useDerivedValue(() => matchedIndex.get() === laidOutIndex.get());
    const tooltipData = useTooltipData(activeDataIndex, data, series, formatValue);
    const activeDataPoint = data.at(activeDataIndex);

    if (!tooltipData || !activeDataPoint) {
        return null;
    }

    const comparison = formatTooltipComparison(activeDataPoint, series, formatValue, preferredLocale);

    return (
        <ChartTooltip
            label={tooltipData.label}
            chartWidth={chartWidth}
            initialTooltipPosition={initialTooltipPosition}
            isVisible={isTooltipActive}
            isContentCurrent={isContentCurrent}
            onChartMoved={onChartMoved}
            onDismiss={onDismiss}
            contentKey={activeDataIndex}
            onContentLayout={() => laidOutIndex.set(activeDataIndex)}
        >
            {comparison ? (
                <ChartTooltipComparison
                    rows={comparison.rows}
                    change={shouldShowTooltipChange ? comparison.change : undefined}
                />
            ) : (
                <ChartTooltipSummary
                    amount={tooltipData.amount}
                    percentage={tooltipData.percentage}
                    expenseCount={tooltipData.expenseCount}
                />
            )}
        </ChartTooltip>
    );
}

export default ChartTooltipLayer;
