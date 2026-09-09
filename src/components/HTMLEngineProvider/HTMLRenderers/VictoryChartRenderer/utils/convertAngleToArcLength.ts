/**
 * Convert angle in degrees to arc length
 */
function convertAngleToArcLength(angle: number, radius: number): number {
    return 2 * Math.PI * radius * (angle / 360);
}

export default convertAngleToArcLength;
