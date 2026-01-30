import {useCallback, useState} from 'react';
import type {ChartBounds} from 'victory-native';

type OnBoundsChange = (bounds: ChartBounds, plotAreaWidth: number) => void;

/**
 * Reusable hook that tracks the plot area width from CartesianChart's `onChartBoundsChange`.
 *
 * @param onBoundsChange - Optional callback for chart-specific logic (e.g. BarChart bar geometry).
 */
function useChartBoundsTracking(onBoundsChange?: OnBoundsChange) {
    const [plotAreaWidth, setPlotAreaWidth] = useState(0);

    const handleChartBoundsChange = useCallback(
        (bounds: ChartBounds) => {
            const width = bounds.right - bounds.left;
            setPlotAreaWidth(width);
            onBoundsChange?.(bounds, width);
        },
        [onBoundsChange],
    );

    return {plotAreaWidth, handleChartBoundsChange};
}

export {useChartBoundsTracking};
export type {OnBoundsChange};
