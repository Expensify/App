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
    // to resolvedLabel.y. Solve for the X that puts that point at a safe radius from center.
    const safeRadius = slice.radius + (labelIndicatorOuterOffset ?? 0);
    const verticalOffsetFromCenter = resolvedLabel.y - slice.center.y;
    const requiredHorizontalOffset = Math.sqrt(Math.max(0, safeRadius ** 2 - verticalOffsetFromCenter ** 2));
    const ringHorizontalOffset = x1 - slice.center.x;
    const labelHorizontalOffset = resolvedLabel.x - slice.center.x;
    const bendHorizontalOffset = Math.min(Math.max(requiredHorizontalOffset, Math.abs(ringHorizontalOffset)), Math.abs(labelHorizontalOffset));
    const bendX = Math.round(slice.center.x + Math.sign(labelHorizontalOffset) * bendHorizontalOffset);

    // A straight line between two points that are each individually outside the ring can still dip
    // inside it if they sit at sufficiently different angles (the chord bows toward center) — visible as
    // the leader line cutting across a neighboring slice when several tiny slices sit close together with
    // very different resolved rows. Find the closest point on the ring-to-bend segment to the center; if
    // it would dip inside the ring, push that point outward onto the ring attachment point's own radius
    // instead of connecting the two directly. This must be checked against innerRadius, not the more
    // generous safeRadius above — the ring attachment point itself always sits at exactly innerRadius by
    // construction, so checking against safeRadius would flag its own neighborhood as unsafe and bulge
    // every single line.
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
