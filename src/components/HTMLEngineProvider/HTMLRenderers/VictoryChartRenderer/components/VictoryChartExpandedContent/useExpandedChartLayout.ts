import {CHART_TYPE, POLAR_CONTAINER_HEIGHT_RATIO} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/constants';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {resolveChartContainerBgColor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useTheme from '@hooks/useTheme';

import type {Dimensions} from '@src/types/utils/Layout';

import type {ColorValue} from 'react-native';

// The zoom headroom shrinks (down to 1, i.e. no zoom) once the fitted render approaches this
// size, so zooming never allocates an excessively large canvas. The fitted render itself is
// never reduced — the chart must at least fill the viewport.
const MAX_CANVAS_DIMENSION = 2048;
// 2x headroom covers typical zoom depth without paying for a larger render surface.
const MAX_ZOOM_HEADROOM = 2;

type ExpandedChartLayout = {
    /** Whether the chart has numeric design dimensions and the available area has been measured */
    hasLayout: boolean;

    /** Uniform scale that fits the chart's (clipped) design box inside the available area (may be > 1) */
    fitScale: number;

    /** The fitted (displayed) size of the chart */
    targetWidth: number;
    targetHeight: number;
    clippedTargetHeight: number;

    /** The zoomed render size of the chart (fitted size × headroom) */
    zoomHeadroom: number;
    renderWidth: number;
    renderHeight: number;
    clippedRenderHeight: number;

    /** Theme-resolved container visuals parsed from the chart HTML */
    backgroundColor: ColorValue | undefined;
    borderRadius: number | undefined;

    /** Whether the chart is polar (pie), whose container is clipped to hide dead canvas space */
    isPolar: boolean;
};

/**
 * Computes the fitted and zoomed render sizes for the expanded chart from the chart's design
 * dimensions and the available modal area, shared by every platform's zoom implementation.
 */
function useExpandedChartLayout(availableSize: Dimensions): ExpandedChartLayout {
    const theme = useTheme();
    const {chartContentStyles, chartContainerStyles, type} = useVictoryChartContext();

    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;
    const hasDesignDimensions = !!designWidth && !!designHeight;
    const isMeasured = availableSize.width > 0 && availableSize.height > 0;

    // Match the inline container: polar charts are clipped to hide the dead space at the
    // bottom of their design canvas, so the expanded chart centers the same way inline does.
    const isPolar = type === CHART_TYPE.POLAR;
    const effectiveDesignHeight = designHeight !== undefined && isPolar ? designHeight * POLAR_CONTAINER_HEIGHT_RATIO : designHeight;

    const fitScale = hasDesignDimensions && effectiveDesignHeight !== undefined && isMeasured ? Math.min(availableSize.width / designWidth, availableSize.height / effectiveDesignHeight) : 1;

    const targetWidth = (designWidth ?? 0) * fitScale;
    const targetHeight = (designHeight ?? 0) * fitScale;
    const clippedTargetHeight = (effectiveDesignHeight ?? 0) * fitScale;

    const zoomHeadroom = Math.max(1, Math.min(MAX_ZOOM_HEADROOM, MAX_CANVAS_DIMENSION / Math.max(targetWidth, targetHeight, 1)));
    const renderWidth = targetWidth * zoomHeadroom;
    const renderHeight = targetHeight * zoomHeadroom;
    const clippedRenderHeight = clippedTargetHeight * zoomHeadroom;

    // Visual styles parsed from the chart HTML — resolved the same way VictoryChartContainerFixed
    // does inline, so the expanded chart keeps the same (theme-aware) background and rounding.
    const backgroundColor = resolveChartContainerBgColor(chartContainerStyles.backgroundColor, theme);
    const borderRadius = typeof chartContainerStyles.borderRadius === 'number' ? chartContainerStyles.borderRadius : undefined;

    return {
        hasLayout: hasDesignDimensions && effectiveDesignHeight !== undefined && isMeasured,
        fitScale,
        targetWidth,
        targetHeight,
        clippedTargetHeight,
        zoomHeadroom,
        renderWidth,
        renderHeight,
        clippedRenderHeight,
        backgroundColor,
        borderRadius,
        isPolar,
    };
}

export default useExpandedChartLayout;
