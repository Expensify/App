/**
 * Labels and legends are positioned with absolute pixel coordinates authored against the
 * chart's original design height. When computeDynamicChartHeight shrinks the canvas for a
 * horizontal bar chart with fewer rows, any overlay whose `y` falls below the new, shorter
 * canvas would render outside it and get clipped by the container's `overflow: hidden`.
 * Shift only those overlays up by the height delta so they land back inside the preserved
 * bottom padding instead of disappearing; overlays already above the new height (e.g. a
 * title near the top) are left untouched.
 */
function computeAdjustedOverlayY(y: number, effectiveHeight: number | undefined, heightDelta: number): number {
    if (heightDelta <= 0 || effectiveHeight === undefined || y <= effectiveHeight) {
        return y;
    }

    return y - heightDelta;
}

export default computeAdjustedOverlayY;
