import {Line, vec} from '@shopify/react-native-skia';
import type {Color} from '@shopify/react-native-skia';
import React from 'react';
import type {ChartBounds, Scale} from 'victory-native';

type LeftFrameLineProps = {
    chartBounds: ChartBounds;
    yTicks: number[];
    yScale: Scale;
    color: Color;
};

function LeftFrameLine({chartBounds, yTicks, yScale, color}: LeftFrameLineProps) {
    // Draw the left frame line anchored at the first tick rather than at the domain minimum.
    // This prevents a visual gap between the frame and the lowest grid line that occurs when
    // victory-native's nice() and ticks() use different step sizes (nice uses count=10,
    // ticks uses Y_AXIS_TICK_COUNT=5), causing the domain minimum to land below the first tick.
    const minTick = yTicks.length > 0 ? Math.min(...yTicks) : null;
    const frameBottomY = minTick !== null ? yScale(minTick) : chartBounds.bottom;

    return (
        <Line
            p1={vec(chartBounds.left, chartBounds.top)}
            p2={vec(chartBounds.left, frameBottomY)}
            color={color}
            strokeWidth={1}
        />
    );
}

LeftFrameLine.displayName = 'LeftFrameLine';
export default LeftFrameLine;
