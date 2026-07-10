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
    const innerRadius = midRadius + (labelIndicatorInnerOffset ?? 0);

    const x1 = Math.round(slice.center.x + innerRadius * Math.cos(midAngle) + (labelIndicatorXShift ?? 0));
    const y1 = Math.round(slice.center.y + innerRadius * Math.sin(midAngle) + (labelIndicatorYShift ?? 0));

    // The final segment must be purely horizontal, at the resolved row's height, so the line meets the
    // label text at that height instead of approaching it at an angle — which fixes the bend point's Y
    // to resolvedLabel.y. Rather than reaching that Y by extending along the slice's own angle (which
    // can overshoot well past the row for slices near the top/bottom seam, or land back inside the ring
    // when the row differs enough from the slice's natural position and there isn't room left before the
    // column), solve directly for how far out in X the bend must sit at that exact Y to clear the ring,
    // clamped between the ring touchpoint and the label itself.
    const safeRadius = slice.radius + (labelIndicatorOuterOffset ?? 0);
    const verticalOffsetFromCenter = resolvedLabel.y - slice.center.y;
    const requiredHorizontalOffset = Math.sqrt(Math.max(0, safeRadius ** 2 - verticalOffsetFromCenter ** 2));
    const ringHorizontalOffset = x1 - slice.center.x;
    const labelHorizontalOffset = resolvedLabel.x - slice.center.x;
    const bendHorizontalOffset = Math.min(Math.max(requiredHorizontalOffset, Math.abs(ringHorizontalOffset)), Math.abs(labelHorizontalOffset));
    const bendX = slice.center.x + Math.sign(labelHorizontalOffset) * bendHorizontalOffset;

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
