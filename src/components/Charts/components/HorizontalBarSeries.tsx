import {Path, Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, PointsArray, Scale} from 'victory-native';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
// eslint-disable-next-line import/no-internal-modules -- reuses victory-native bar corner geometry
import {createRoundedRectPath} from 'victory-native/dist/utils/createRoundedRectPath';

type HorizontalBarSeriesProps = {
    points: PointsArray;
    chartBounds: ChartBounds;
    xScale: Scale;
    getBarColor: (index: number) => string;
    barCount: number;
};

const HORIZONTAL_BAR_CORNER_RADIUS = {topLeft: 0, topRight: 8, bottomLeft: 0, bottomRight: 8};

/**
 * Renders individually colored horizontal bars for a single data series.
 * victory-native's BarGroup supports horizontal layout but not per-bar colors in a single series.
 */
function HorizontalBarSeries({points, chartBounds, xScale, getBarColor, barCount}: HorizontalBarSeriesProps) {
    const boundHeight = chartBounds.bottom - chartBounds.top;
    const groupWidth = ((1 - BAR_INNER_PADDING) * boundHeight) / Math.max(1, barCount);
    const barWidth = groupWidth * (1 - BAR_INNER_PADDING);
    const xZero = xScale(0);

    const barPaths = points.map((point) => {
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
            return null;
        }

        const barLength = Math.max(0, point.x - xZero);
        if (barLength === 0) {
            return null;
        }

        const yTop = point.y - barWidth / 2;
        const path = Skia.Path.Make();
        path.addRRect(createRoundedRectPath(xZero, yTop, barLength, barWidth, HORIZONTAL_BAR_CORNER_RADIUS, Number(point.xValue ?? 0)));
        return path;
    });

    return barPaths.map((barPath, index) => {
        if (!barPath) {
            return null;
        }

        return (
            <Path
                // eslint-disable-next-line react/no-array-index-key -- bar order is stable for the chart lifetime
                key={`horizontal-bar-${index}`}
                path={barPath}
                color={getBarColor(index)}
                style="fill"
            />
        );
    });
}

export default HorizontalBarSeries;
