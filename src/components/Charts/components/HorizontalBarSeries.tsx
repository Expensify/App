import {Path, Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, PointsArray, Scale} from 'victory-native';
import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import {createRoundedRectPath} from '@components/Charts/utils';

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

    const barPaths = points.map((point, index) => {
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
        return {path, index};
    });

    return barPaths.map((barPath) => {
        if (!barPath) {
            return null;
        }

        return (
            <Path
                key={`horizontal-bar-${barPath.index}`}
                path={barPath.path}
                color={getBarColor(barPath.index)}
                // eslint-disable-next-line react/style-prop-object -- Skia Path uses string style values, not React Native style objects
                style="fill"
            />
        );
    });
}

export default HorizontalBarSeries;
