import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, X_AXIS_LABEL_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import variables from '@styles/variables';

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

function getPieChartLoadingHeight(shouldShowLegend = true): number {
    const legendFirstRowHeight = shouldShowLegend ? variables.pieChartLegendMargin + variables.fontSizeNormalHeight : 0;
    return CHART_CONTENT_MIN_HEIGHT + legendFirstRowHeight;
}

export {getXAxisLabelSpace, getCartesianChartHeight, getBarChartHeight, getPieChartLoadingHeight};
