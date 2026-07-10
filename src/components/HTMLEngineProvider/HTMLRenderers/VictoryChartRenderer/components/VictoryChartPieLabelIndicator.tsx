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
    // Anchor to the same angle the label layout resolved to (not a fresh `(slice.startAngle +
    // slice.endAngle) / 2`) — for a single 100%-value slice those two disagree, since the slice's own
    // start/end angle still spans the whole circle even though the label was placed at a fixed,
    // always-safe spot instead of that circle's arbitrary "midpoint".
    const {midAngle} = resolvedLabel;
    const midRadius = (slice.radius + slice.innerRadius) / 2;
    const labelIndicatorInnerRadius = midRadius + (labelIndicatorInnerOffset ?? 0);

    const x1 = Math.round(slice.center.x + labelIndicatorInnerRadius * Math.cos(midAngle) + (labelIndicatorXShift ?? 0));
    const y1 = Math.round(slice.center.y + labelIndicatorInnerRadius * Math.sin(midAngle) + (labelIndicatorYShift ?? 0));

    // Bend near the ring first — a short diagonal that covers both the x and y offset toward the
    // resolved row — then run flat into the label (x only) so the line meets the text at its own
    // height instead of approaching it at an angle.
    const availableRun = resolvedLabel.x - x1;
    const diagonalRunX = Math.sign(availableRun) * Math.min(Math.abs(labelIndicatorOuterOffset ?? 0), Math.abs(availableRun));
    const bendX = x1 + diagonalRunX;

    const path = Skia.Path.Make();
    path.moveTo(x1, y1);
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
