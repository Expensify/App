import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, MAX_BAR_LABEL_LINES, X_AXIS_LABEL_LINE_HEIGHT, X_AXIS_LABEL_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import variables from '@styles/variables';

import CONST from '@src/CONST';

// Imported before the chart engine has loaded, so this file must not import Skia.

function getXAxisLabelSpace(xAxisLabelHeight = 0): number {
    return VictoryTheme.axis.xAxisLabelGap + Math.max(xAxisLabelHeight, X_AXIS_LABEL_MIN_HEIGHT);
}

function getCartesianChartHeight(xAxisLabelHeight = 0): number {
    return CHART_CONTENT_MIN_HEIGHT + getXAxisLabelSpace(xAxisLabelHeight);
}

function getBarChartHeight(shouldShowLabels = true, xAxisLabelHeight = 0): number {
    return shouldShowLabels ? getCartesianChartHeight(xAxisLabelHeight) : CHART_CONTENT_MIN_HEIGHT;
}

// Wrapped labels keep every line of label space even when the names fit on fewer, so their height is known before the chart measures them.
// Mirrors the wrap height `VerticalBarChartContent` draws, so update the two together.
function getBarChartLoadingHeight(shouldShowLabels = true, shouldWrapLabels = false): number {
    return getBarChartHeight(shouldShowLabels, shouldWrapLabels ? MAX_BAR_LABEL_LINES * X_AXIS_LABEL_LINE_HEIGHT : 0);
}

/** Whether the card leaves the responsive legend its minimum width beside a square donut. */
function hasRoomForSideLegend(chartWidth: number): boolean {
    return chartWidth - CHART_CONTENT_MIN_HEIGHT - VictoryTheme.pie.legendGap >= VictoryTheme.pie.legendMinWidth;
}

// Mirrors the legend layouts `PieChartContent` draws with the `pieChartLegend*` and `pieChartResponsive*` styles, so update it with any change to their structure or spacing.
function getPieChartLoadingHeight(chartWidth: number | null, shouldUseNarrowLayout: boolean, shouldShowLegend = true, shouldUseResponsiveLegend = false): number {
    if (shouldShowLegend && shouldUseResponsiveLegend) {
        // Until the card reports its width, the layout stands in for it: phone cards are too narrow for a side legend, and typical desktop cards fit one
        const isLegendSideBySide = chartWidth === null ? !shouldUseNarrowLayout : hasRoomForSideLegend(chartWidth);
        if (isLegendSideBySide) {
            return CHART_CONTENT_MIN_HEIGHT;
        }

        // The slice count arrives with the data, so this reserves a full Home top-N list, which most cards fill.
        // A row is as tall as the taller of its dot column and its label's first line.
        const rowCount = CONST.SEARCH.TOP_SEARCH_LIMIT;
        const rowHeight = Math.max(variables.lineHeightXLarge, variables.fontSizeNormalHeight);
        return CHART_CONTENT_MIN_HEIGHT + VictoryTheme.pie.legendStackGap + rowCount * rowHeight + (rowCount - 1) * VictoryTheme.pie.legendRowGap;
    }

    const legendFirstRowHeight = shouldShowLegend ? variables.pieChartLegendMargin + variables.fontSizeNormalHeight : 0;
    return CHART_CONTENT_MIN_HEIGHT + legendFirstRowHeight;
}

export {getXAxisLabelSpace, getCartesianChartHeight, getBarChartHeight, getBarChartLoadingHeight, hasRoomForSideLegend, getPieChartLoadingHeight};
