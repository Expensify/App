import type {TextAnchor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import convertDegreeToRadian from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/convertDegreeToRadian';

import type {Color} from '@shopify/react-native-skia';
import type {PieSliceData} from 'victory-native';

import {Path, Skia} from '@shopify/react-native-skia';
import React from 'react';

type ResolvedPieLabel = {
    x: number;
    y: number;
    textAnchor: TextAnchor;
};

type VictoryChartPieLabelIndicatorProps = {
    slice: PieSliceData;
    labelRadius: number;
    resolvedLabel: ResolvedPieLabel;
    labelIndicatorXShift: number | undefined;
    labelIndicatorYShift: number | undefined;
    labelIndicatorStroke: Color | undefined;
    labelIndicatorStrokeWidth: number;
    labelIndicatorInnerOffset: number | undefined;
    labelIndicatorOuterOffset: number | undefined;
};

function VictoryChartPieLabelIndicator({
    slice,
    labelRadius,
    resolvedLabel,
    labelIndicatorXShift,
    labelIndicatorYShift,
    labelIndicatorStroke,
    labelIndicatorStrokeWidth,
    labelIndicatorInnerOffset,
    labelIndicatorOuterOffset,
}: VictoryChartPieLabelIndicatorProps) {
    const midAngle = convertDegreeToRadian((slice.startAngle + slice.endAngle) / 2);
    const midRadius = (slice.radius + slice.innerRadius) / 2;
    const labelIndicatorInnerRadius = midRadius + (labelIndicatorInnerOffset ?? 0);
    const labelIndicatorOuterRadius = labelRadius - (labelIndicatorOuterOffset ?? 0);

    const x1 = Math.round(slice.center.x + labelIndicatorInnerRadius * Math.cos(midAngle) + (labelIndicatorXShift ?? 0));
    const y1 = Math.round(slice.center.y + labelIndicatorInnerRadius * Math.sin(midAngle) + (labelIndicatorYShift ?? 0));

    const x2 = Math.round(slice.center.x + labelIndicatorOuterRadius * Math.cos(midAngle) + (labelIndicatorXShift ?? 0));
    const y2 = Math.round(slice.center.y + labelIndicatorOuterRadius * Math.sin(midAngle) + (labelIndicatorYShift ?? 0));

    const path = Skia.Path.Make();
    path.moveTo(x1, y1);
    path.lineTo(x2, y2);
    path.lineTo(resolvedLabel.x, resolvedLabel.y);

    return (
        <Path
            path={path}
            // This is an external component and `style` is not an object
            // eslint-disable-next-line react/style-prop-object
            style="stroke"
            strokeWidth={labelIndicatorStrokeWidth}
            color={labelIndicatorStroke}
        />
    );
}

VictoryChartPieLabelIndicator.displayName = 'VictoryChartPieLabelIndicator';

export default VictoryChartPieLabelIndicator;
