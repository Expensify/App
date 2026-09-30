import {getCartesianPlotBounds} from '@components/Charts/utils';
import VictoryTheme from '@components/Charts/VictoryTheme';

import type {ChartBounds} from 'victory-native';

import {drawOffscreen, makeOffscreenSurface} from '@shopify/react-native-skia/lib/module/headless';
import React from 'react';
import {CartesianChart} from 'victory-native';

const CHART_WIDTH = 400;
const CHART_HEIGHT = 250;

/** Stands in for the space a chart leaves for its own y-axis labels. */
const CHART_PADDING_LEFT = 37;

const DATA = [
    {x: 0, y: 120},
    {x: 1, y: 80},
    {x: 2, y: 45},
];

const captured: {bounds: ChartBounds | null} = {bounds: null};

const chartElement = (
    <CartesianChart
        explicitSize={{width: CHART_WIDTH, height: CHART_HEIGHT}}
        headless
        xKey="x"
        yKeys={['y']}
        padding={{...VictoryTheme.axis.padding, left: CHART_PADDING_LEFT}}
        domainPadding={{top: 16, bottom: 16, left: 8, right: 8}}
        xAxis={{
            tickCount: DATA.length,
            lineWidth: VictoryTheme.axis.xLineWidth,
        }}
        yAxis={[
            {
                tickCount: VictoryTheme.axis.tickCount,
                lineWidth: VictoryTheme.axis.yLineWidth,
                labelOffset: VictoryTheme.axis.labelGap,
            },
        ]}
        frame={{lineWidth: 0}}
        data={DATA}
    >
        {({chartBounds}) => {
            // The bounds reach onChartBoundsChange from an effect, which the offscreen draw never flushes, so they
            // are read here instead. Both come from the same value the chart computes for its own layout.
            captured.bounds = chartBounds;
            return null;
        }}
    </CartesianChart>
);

using surface = makeOffscreenSurface(CHART_WIDTH, CHART_HEIGHT);
using image = await drawOffscreen(surface, chartElement);

if (!image) {
    throw new Error('Skia failed to draw the probe chart');
}

if (!captured.bounds) {
    throw new Error('CartesianChart never reported its bounds');
}

const predicted = getCartesianPlotBounds(CHART_WIDTH, CHART_PADDING_LEFT);

console.log(JSON.stringify({predicted, reported: {left: captured.bounds.left, right: captured.bounds.right}}));
