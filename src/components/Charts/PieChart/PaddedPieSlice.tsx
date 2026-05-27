import {FillType, Path, Skia} from '@shopify/react-native-skia';
import React from 'react';
import type {PieSliceData} from 'victory-native';

type PaddedPieSliceProps = {
    /** Slice data provided by Pie.Chart's children render function */
    slice: PieSliceData;

    /** Total angular gap in degrees between adjacent slices. */
    padAngle: number;
};

/**
 * Minimum visible arc sweep in degrees.
 * Prevents tiny slices from being omitted when padAngle exceeds the slice's sweep.
 */
const MIN_VISIBLE_SWEEP_ANGLE = 0.1;

/**
 * A pie slice whose angular path is shrunk by padAngle/2 on each side,
 * creating equal visual gaps between all adjacent slices.
 */
function PaddedPieSlice({slice, padAngle}: PaddedPieSliceProps) {
    const {center, innerRadius, radius, sliceIsEntireCircle} = slice;

    const p = Skia.Path.Make();

    if (sliceIsEntireCircle) {
        p.addOval(Skia.XYWHRect(center.x - radius, center.y - radius, radius * 2, radius * 2));
        if (innerRadius > 0) {
            p.addOval(Skia.XYWHRect(center.x - innerRadius, center.y - innerRadius, innerRadius * 2, innerRadius * 2));
            p.setFillType(FillType.EvenOdd);
        }
    } else {
        const sweepAngle = slice.endAngle - slice.startAngle;
        // Clamp halfPad so the rendered arc always has at least MIN_VISIBLE_SWEEP_ANGLE.
        const halfPad = Math.min(padAngle / 2, Math.max(0, (sweepAngle - MIN_VISIBLE_SWEEP_ANGLE) / 2));
        const startAngle = slice.startAngle + halfPad;
        const endAngle = slice.endAngle - halfPad;

        if (endAngle <= startAngle) {
            return null;
        }

        // Outer arc
        p.arcToOval(Skia.XYWHRect(center.x - radius, center.y - radius, radius * 2, radius * 2), startAngle, endAngle - startAngle, false);

        if (innerRadius > 0) {
            // Inner arc in reverse to close the donut ring
            p.arcToOval(Skia.XYWHRect(center.x - innerRadius, center.y - innerRadius, innerRadius * 2, innerRadius * 2), endAngle, startAngle - endAngle, false);
        } else {
            p.lineTo(center.x, center.y);
        }
    }

    return (
        <Path
            path={p}
            color={slice.color}
            // eslint-disable-next-line react/style-prop-object -- this is a valid Skia style prop value
            style="fill"
        />
    );
}

export default PaddedPieSlice;
