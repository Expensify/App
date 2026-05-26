import type {PieChartConfig} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type Point = {
    x: number;
    y: number;
};

type PieLabelIndicatorGeometry = {
    start: Point;
    elbow: Point;
    label: Point;
};

/**
 * Computes label indicator line geometry to match VictoryPie's LineSegment / ShiftedLineSegment layout.
 *
 * @see victory-pie getLabelIndicatorPropsForLineSegment
 * - inner offset starts at average(innerRadius, outerRadius) + labelIndicatorInnerOffset
 * - outer offset ends at labelRadius - labelIndicatorOuterOffset
 * - optional dy shifts the outer elbow point perpendicular to the radial direction
 */
function getPieLabelIndicatorGeometry({
    center,
    innerRadius,
    outerRadius,
    labelRadius,
    labelX,
    labelY,
    pieConfig,
}: {
    center: Point;
    innerRadius: number;
    outerRadius: number;
    labelRadius: number;
    labelX: number;
    labelY: number;
    pieConfig: PieChartConfig;
}): PieLabelIndicatorGeometry | null {
    const labelIndicatorInnerOffset = pieConfig.labelIndicatorInnerOffset;
    const labelIndicatorOuterOffset = pieConfig.labelIndicatorOuterOffset;

    if (labelIndicatorInnerOffset === undefined && labelIndicatorOuterOffset === undefined && pieConfig.labelIndicatorStroke === undefined) {
        return null;
    }

    const middleRadius = (innerRadius + outerRadius) / 2;
    const startRadius = middleRadius + (labelIndicatorInnerOffset ?? 0);
    const endRadius = labelRadius - (labelIndicatorOuterOffset ?? 0);

    const deltaX = labelX - center.x;
    const deltaY = labelY - center.y;
    const distanceToLabel = Math.hypot(deltaX, deltaY);

    if (distanceToLabel <= 0) {
        return null;
    }

    const unitX = deltaX / distanceToLabel;
    const unitY = deltaY / distanceToLabel;

    const start = {
        x: center.x + unitX * startRadius,
        y: center.y + unitY * startRadius,
    };

    const elbow = {
        x: center.x + unitX * endRadius,
        y: center.y + unitY * endRadius,
    };

    const shiftDy = pieConfig.labelIndicatorDy ?? 0;

    if (shiftDy !== 0) {
        // ShiftedLineSegment applies dy perpendicular to the radial segment.
        elbow.x += -unitY * shiftDy;
        elbow.y += unitX * shiftDy;
    }

    return {
        start,
        elbow,
        label: {
            x: labelX,
            y: labelY,
        },
    };
}

export type {PieLabelIndicatorGeometry, Point};
export default getPieLabelIndicatorGeometry;
