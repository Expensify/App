import {POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {DOUBLE_TAP_SCALE} from '@components/MultiGestureCanvas/constants';

import type {Dimensions} from '@src/types/utils/Layout';

import scalePixels from './scalePixels';

// Zoom headroom shrinks (down to 1 = no zoom) once the fitted render nears this size, so the
// zoomed canvas never gets excessively large. The fitted render itself always fills the viewport.
const MAX_CANVAS_DIMENSION = 2048;
// MultiGestureCanvas double-taps to at least DOUBLE_TAP_SCALE, so the headroom must reach it for
// double-tap to land on rendered (not upscaled) pixels.
const MAX_ZOOM_HEADROOM = DOUBLE_TAP_SCALE;

type ExpandedChartDesign = {
    /** Design-space chart size parsed from the chart HTML, if it declares one */
    designWidth: number | undefined;
    designHeight: number | undefined;

    /** Design-space container corner radius parsed from the chart HTML */
    borderRadius: number | undefined;

    /** Whether the chart is polar (pie), whose container is clipped to hide dead canvas space */
    isPolar: boolean;
};

type ExpandedChartLayout = {
    /** Whether the chart has design dimensions and the available area has been measured */
    hasLayout: boolean;

    /** Uniform scale that fits the (clipped) design box inside the available area (may be > 1) */
    fitScale: number;

    /** Fitted (displayed) size */
    targetWidth: number;
    targetHeight: number;
    clippedTargetHeight: number;

    /** Zoomed render size (fitted size × headroom) */
    zoomHeadroom: number;
    renderWidth: number;
    renderHeight: number;
    clippedRenderHeight: number;

    /** Container corner radius scaled to the render size */
    renderBorderRadius: number | undefined;

    isPolar: boolean;
};

/** Pure sizing math for the expanded chart: fitted size, zoom headroom, and the resulting render size. */
function computeExpandedChartLayout({designWidth, designHeight, borderRadius, isPolar}: ExpandedChartDesign, availableSize: Dimensions): ExpandedChartLayout {
    const hasDesignDimensions = !!designWidth && !!designHeight;
    const isMeasured = availableSize.width > 0 && availableSize.height > 0;

    // Polar charts are clipped like inline to hide the dead space at the bottom of their canvas.
    const effectiveDesignHeight = designHeight !== undefined && isPolar ? designHeight * POLAR_CONTAINER_HEIGHT_RATIO : designHeight;

    const fitScale = hasDesignDimensions && effectiveDesignHeight !== undefined && isMeasured ? Math.min(availableSize.width / designWidth, availableSize.height / effectiveDesignHeight) : 1;

    const targetWidth = (designWidth ?? 0) * fitScale;
    const targetHeight = (designHeight ?? 0) * fitScale;
    const clippedTargetHeight = (effectiveDesignHeight ?? 0) * fitScale;

    const zoomHeadroom = Math.max(1, Math.min(MAX_ZOOM_HEADROOM, MAX_CANVAS_DIMENSION / Math.max(targetWidth, targetHeight, 1)));

    return {
        hasLayout: hasDesignDimensions && effectiveDesignHeight !== undefined && isMeasured,
        fitScale,
        targetWidth,
        targetHeight,
        clippedTargetHeight,
        zoomHeadroom,
        renderWidth: targetWidth * zoomHeadroom,
        renderHeight: targetHeight * zoomHeadroom,
        clippedRenderHeight: clippedTargetHeight * zoomHeadroom,
        renderBorderRadius: scalePixels(borderRadius, fitScale * zoomHeadroom),
        isPolar,
    };
}

export default computeExpandedChartLayout;
export {MAX_CANVAS_DIMENSION, MAX_ZOOM_HEADROOM};
export type {ExpandedChartLayout};
