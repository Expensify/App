const CIRCLE_SWEEP_DEGREES = 360;

type PieChartPadAngleLayout = {
    circleSweepDegrees: number;
    startAngle: number;
    padAngle: number;
};

/**
 * Maps Victory `padAngle` (degrees of separation per slice) to victory-native `Pie.Chart` props.
 */
function getPieChartPadAngleLayout(padAngle: number, sliceCount: number): PieChartPadAngleLayout {
    if (padAngle <= 0 || sliceCount === 0) {
        return {
            circleSweepDegrees: CIRCLE_SWEEP_DEGREES,
            startAngle: 0,
            padAngle: 0,
        };
    }

    return {
        circleSweepDegrees: CIRCLE_SWEEP_DEGREES - padAngle * sliceCount,
        startAngle: padAngle / 2,
        padAngle,
    };
}

/**
 * Converts a pad angle in degrees to a stroke width at the given pie radius.
 */
function getAngularInsetStrokeWidth(padAngleDegrees: number, radius: number): number {
    return ((padAngleDegrees * Math.PI) / 180) * radius;
}

export {getPieChartPadAngleLayout, getAngularInsetStrokeWidth};
export type {PieChartPadAngleLayout};
