import type {CartesianChartProps} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type Padding = CartesianChartProps['padding'];

/**
 * Backend horizontal bar charts are authored for up to five rows at this height.
 * @see Web-Expensify/lib/ChatBot/Persona/Tools/AnalyzeExpensesTool.php horizontal bar reference shape
 */
const HORIZONTAL_BAR_REFERENCE_ROW_COUNT = 5;
const HORIZONTAL_BAR_REFERENCE_HEIGHT = 464;

/**
 * Default padding for Concierge horizontal bar charts when padding is missing from the HTML.
 */
const DEFAULT_HORIZONTAL_BAR_PADDING = {
    top: 92,
    bottom: 84,
} as const;

function getPaddingValue(padding: Padding, side: 'top' | 'bottom', fallback: number): number {
    if (typeof padding === 'number') {
        return padding;
    }

    if (padding && typeof padding === 'object' && typeof padding[side] === 'number') {
        return padding[side];
    }

    return fallback;
}

type ComputeDynamicChartHeightParams = {
    designHeight: number | undefined;
    isHorizontal: boolean | undefined;
    itemCount: number;
    padding: Padding;
};

/**
 * Derives a shorter canvas height for horizontal bar charts that have fewer rows than the
 * backend's fixed five-row reference height, keeping row spacing consistent.
 */
function computeDynamicChartHeight({designHeight, isHorizontal, itemCount, padding}: ComputeDynamicChartHeightParams): number | undefined {
    if (!isHorizontal || designHeight === undefined || itemCount <= 0 || itemCount >= HORIZONTAL_BAR_REFERENCE_ROW_COUNT) {
        return designHeight;
    }

    const paddingTop = getPaddingValue(padding, 'top', DEFAULT_HORIZONTAL_BAR_PADDING.top);
    const paddingBottom = getPaddingValue(padding, 'bottom', DEFAULT_HORIZONTAL_BAR_PADDING.bottom);
    const referencePlotHeight = HORIZONTAL_BAR_REFERENCE_HEIGHT - paddingTop - paddingBottom;

    if (referencePlotHeight <= 0) {
        return designHeight;
    }

    const rowHeight = referencePlotHeight / HORIZONTAL_BAR_REFERENCE_ROW_COUNT;
    const dynamicHeight = paddingTop + paddingBottom + rowHeight * itemCount;

    return Math.min(Math.round(dynamicHeight), designHeight);
}

export default computeDynamicChartHeight;
