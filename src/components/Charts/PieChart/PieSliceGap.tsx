import {Path, Skia} from '@shopify/react-native-skia';
import React, {useMemo} from 'react';
import type {PieSliceData} from 'victory-native';

type PieSliceGapProps = {
    /** Slice data provided by Pie.Chart's children render function */
    slice: PieSliceData;

    /** Angular width of the gap in degrees (analogous to victory's padAngle) */
    gapDegrees: number;
};

/**
 * Cuts a transparent radial gap at the start boundary of a pie slice.
 *
 * Uses BlendMode.Clear to erase pixels rather than painting over them with
 * a background colour, so the gap is truly transparent regardless of what
 * sits behind the chart.
 *
 * Each slice draws one gap at its startAngle, so every inter-slice boundary
 * is covered exactly once across all slices.
 *
 * The pixel stroke width is derived from gapDegrees and the slice radius via
 * the arc-to-chord approximation: strokePx = 2r·sin(gapDegrees/2).
 */
function PieSliceGap({slice, gapDegrees}: PieSliceGapProps) {
    const path = useMemo(() => {
        if (slice.sliceIsEntireCircle) {
            return null;
        }

        const {center, innerRadius, radius, startAngle} = slice;
        const angleRad = (startAngle * Math.PI) / 180;
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);

        const p = Skia.Path.Make();
        p.moveTo(center.x + innerRadius * cosA, center.y + innerRadius * sinA);
        p.lineTo(center.x + radius * cosA, center.y + radius * sinA);
        return p;
    }, [slice]);

    if (!path) {
        return null;
    }

    const strokeWidth = 2 * slice.radius * Math.sin(((gapDegrees / 2) * Math.PI) / 180);

    return (
        <Path
            path={path}
            blendMode="clear"
            // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
            style="stroke"
            strokeWidth={strokeWidth}
        />
    );
}

export default PieSliceGap;
