import type {ResolvedPieLabel} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {Color} from '@shopify/react-native-skia';
import type {PieSliceData} from 'victory-native';

import {Path, Skia} from '@shopify/react-native-skia';
import React from 'react';

type VictoryChartPieLabelIndicatorProps = {
    slice: PieSliceData;
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
    resolvedLabel,
    labelIndicatorXShift,
    labelIndicatorYShift,
    labelIndicatorStroke,
    labelIndicatorStrokeWidth,
    labelIndicatorInnerOffset,
    labelIndicatorOuterOffset,
}: VictoryChartPieLabelIndicatorProps) {
    const {midAngle} = resolvedLabel;
    const midRadius = (slice.radius + slice.innerRadius) / 2;
    const innerRadius = midRadius + (labelIndicatorInnerOffset ?? 0);

    const x1 = Math.round(slice.center.x + innerRadius * Math.cos(midAngle) + (labelIndicatorXShift ?? 0));
    const y1 = Math.round(slice.center.y + innerRadius * Math.sin(midAngle) + (labelIndicatorYShift ?? 0));

    const safeRadius = slice.radius + (labelIndicatorOuterOffset ?? 0);
    const verticalOffsetFromCenter = resolvedLabel.y - slice.center.y;
    const requiredHorizontalOffset = Math.sqrt(Math.max(0, safeRadius ** 2 - verticalOffsetFromCenter ** 2));
    const ringHorizontalOffset = x1 - slice.center.x;
    const labelHorizontalOffset = resolvedLabel.x - slice.center.x;
    const bendHorizontalOffset = Math.min(Math.max(requiredHorizontalOffset, Math.abs(ringHorizontalOffset)), Math.abs(labelHorizontalOffset));
    const bendX = Math.round(slice.center.x + Math.sign(labelHorizontalOffset) * bendHorizontalOffset);

    const segmentDx = bendX - x1;
    const segmentDy = resolvedLabel.y - y1;
    const segmentLengthSquared = segmentDx ** 2 + segmentDy ** 2;
    const closestT = segmentLengthSquared > 0 ? Math.min(1, Math.max(0, (-(x1 - slice.center.x) * segmentDx - (y1 - slice.center.y) * segmentDy) / segmentLengthSquared)) : 0;
    const closestX = x1 + closestT * segmentDx - slice.center.x;
    const closestY = y1 + closestT * segmentDy - slice.center.y;
    const closestDistance = Math.sqrt(closestX ** 2 + closestY ** 2);
    const bulgePoint =
        closestDistance > 0 && closestDistance < innerRadius
            ? {x: slice.center.x + (closestX * innerRadius) / closestDistance, y: slice.center.y + (closestY * innerRadius) / closestDistance}
            : undefined;

    const path = Skia.Path.Make();
    path.moveTo(x1, y1);
    if (bulgePoint) {
        path.lineTo(bulgePoint.x, bulgePoint.y);
    }
    path.lineTo(bendX, resolvedLabel.y);
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
