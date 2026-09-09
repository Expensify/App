/**
 * Computes a uniform scale factor to fit a chart of `designWidth` into `availableWidth`,
 * capping at 1 so the chart never scales up beyond its original size.
 */
function computeChartScale(designWidth: number | undefined, availableWidth: number): number {
    if (!designWidth || availableWidth <= 0) {
        return 1;
    }
    return Math.min(availableWidth / designWidth, 1);
}

export default computeChartScale;
