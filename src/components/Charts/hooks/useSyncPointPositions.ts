import type {ChartDataPoint, ChartSeries} from '@components/Charts/types';

import type {Scale} from 'victory-native';

import {useEffect, useRef} from 'react';

/**
 * Returns the canvas x and y of each point. The y is the highest series', so the tooltip above it never covers another one.
 * A point with no values, like a bucket whose stages are all unavailable, sits at 0 so its tooltip still has a position.
 */
function getHighestPointPositions(data: ChartDataPoint[], series: readonly ChartSeries[], xScale: (value: number) => number, yScale: (value: number) => number): [number[], number[]] {
    return [
        data.map((point, index) => xScale(index)),
        data.map((point) => {
            const values = series.flatMap(({key}) => point.values[key] ?? []);
            return yScale(values.length > 0 ? Math.max(...values) : 0);
        }),
    ];
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
export {getHighestPointPositions};
