import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

import type {Scale} from 'victory-native';

import {useEffect, useRef} from 'react';

/** Returns the canvas x and y of each point. The y is the highest series', so the tooltip above it never covers another one. */
function getHighestPointPositions(data: ChartDataPoint[], series: readonly ChartSeries[], xScale: Scale, yScale: Scale): [number[], number[]] {
    return [data.map((point, index) => xScale(index)), data.map((point) => yScale(Math.max(...series.flatMap(({key}) => point.values[key] ?? []))))];
}

/** Returns a function that sets the points' canvas positions from the given scales, and sets them again whenever the data changes. */
function useSyncPointPositions(data: ChartDataPoint[], series: readonly ChartSeries[], setPointPositions: (ox: number[], oy: number[]) => void): (xScale: Scale, yScale: Scale) => void {
    const scales = useRef<{xScale: Scale; yScale: Scale} | null>(null);

    // Victory reports the scales only when they change, and new values often keep the same rounded axes
    useEffect(() => {
        if (!scales.current) {
            return;
        }
        setPointPositions(...getHighestPointPositions(data, series, scales.current.xScale, scales.current.yScale));
    }, [data, series, setPointPositions]);

    return (xScale: Scale, yScale: Scale) => {
        scales.current = {xScale, yScale};
        setPointPositions(...getHighestPointPositions(data, series, xScale, yScale));
    };
}

export default useSyncPointPositions;
