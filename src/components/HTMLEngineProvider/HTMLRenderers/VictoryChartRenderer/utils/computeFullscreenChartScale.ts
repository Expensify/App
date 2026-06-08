/**
 * Computes a uniform scale factor to fit a chart of `designWidth` into `availableWidth`,
 * allowing scale values greater than 1 so the chart can grow to fill a full-screen modal.
 */
function computeFullscreenChartScale(designWidth: number | undefined, availableWidth: number): number {
    if (!designWidth || availableWidth <= 0) {
        return 1;
    }
    return availableWidth / designWidth;
}

export default computeFullscreenChartScale;
