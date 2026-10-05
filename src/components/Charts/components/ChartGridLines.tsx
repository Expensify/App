import VictoryTheme from '@components/Charts/VictoryTheme';

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

const [DASH_LENGTH, DASH_GAP] = VictoryTheme.axis.gridDashIntervals;
const STROKE_WIDTH = VictoryTheme.axis.yLineWidth;

// Round caps add half the stroke width to each end of a dash, so shorten dashes to keep the visible lengths.
const DASH_INTERVALS = [Math.max(0, DASH_LENGTH - STROKE_WIDTH), DASH_GAP + STROKE_WIDTH];

function ChartGridLines({yTicks, yScale, chartBounds, color}: ChartGridLinesProps) {
    return yTicks.map((tick) => {
        const y = yScale(tick);
        return (
            <Line
                key={`grid-line-${tick}`}
                p1={vec(chartBounds.left, y)}
                p2={vec(chartBounds.right, y)}
                color={color}
                strokeWidth={STROKE_WIDTH}
                strokeCap="round"
            >
                <DashPathEffect intervals={DASH_INTERVALS} />
            </Line>
        );
    });
}

export default ChartGridLines;
