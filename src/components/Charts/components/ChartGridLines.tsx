import VictoryTheme, {DASH_INTERVALS} from '@components/Charts/VictoryTheme';

import type {Color} from '@shopify/react-native-skia';
import type {ChartBounds, Scale} from 'victory-native';

import {DashPathEffect, Line, vec} from '@shopify/react-native-skia';
import React from 'react';

type ChartGridLinesProps = {
    /** Tick values a grid line is drawn at. */
    yTicks: number[];

    /** Maps a tick value to its y-pixel position. */
    yScale: Scale;

    /** Chart plot area bounds the lines span. */
    chartBounds: ChartBounds;

    /** Stroke color of the lines. */
    color: Color;
};

const STROKE_WIDTH = VictoryTheme.axis.yLineWidth;

function ChartGridLines({yTicks, yScale, chartBounds, color}: ChartGridLinesProps) {
    return yTicks.map((tick) => {
        // The plot is clipped at its bottom edge, so a line sitting on it would lose its lower half.
        const y = Math.min(yScale(tick), chartBounds.bottom - STROKE_WIDTH / 2);
        return (
            <Line
                key={`grid-line-${tick}`}
                p1={vec(chartBounds.left, y)}
                p2={vec(chartBounds.right, y)}
                color={color}
                strokeWidth={STROKE_WIDTH}
                strokeCap="round"
            >
                {tick !== 0 && <DashPathEffect intervals={DASH_INTERVALS} />}
            </Line>
        );
    });
}

export default ChartGridLines;
