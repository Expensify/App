import {Path, Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {PieSliceData} from 'victory-native';

type VictoryChartPieLabelIndicatorProps = {
    slice: PieSliceData;
    labelRadius: number;
    labelIndicatorInnerOffset: number | undefined;
    labelIndicatorOuterOffset: number | undefined;
};
const RADIAN = Math.PI / 180;

function VictoryChartPieLabelIndicator({slice, labelRadius, labelIndicatorInnerOffset, labelIndicatorOuterOffset}: VictoryChartPieLabelIndicatorProps) {
    const midAngle = (slice.startAngle + slice.endAngle) / 2;
    const midRadius = (slice.radius + slice.innerRadius) / 2;
    const labelIndicatorInnerRadius = midRadius + (labelIndicatorInnerOffset ?? 0);
    const labelIndicatorOuterRadius = labelRadius - (labelIndicatorOuterOffset ?? 0);

    const x1 = slice.center.x + labelIndicatorInnerRadius * Math.cos(-midAngle * RADIAN);
    const y1 = slice.center.y + labelIndicatorInnerRadius * Math.sin(midAngle * RADIAN);

    const x2 = slice.center.x + labelIndicatorOuterRadius * Math.cos(-midAngle * RADIAN);
    const y2 = slice.center.y + labelIndicatorOuterRadius * Math.sin(midAngle * RADIAN);

    const path = Skia.Path.Make();
    path.moveTo(x1, y1);
    path.lineTo(x2, y2);

    return (
        <Path
            path={path}
            style="stroke"
            strokeWidth={4}
            color="blue"
        />
    );
}

VictoryChartPieLabelIndicator.displayName = 'VictoryChartPieLabelIndicator';

export default VictoryChartPieLabelIndicator;
