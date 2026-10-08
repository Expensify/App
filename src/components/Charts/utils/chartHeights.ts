import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, X_AXIS_LABEL_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

// Imported before the chart engine has loaded, so this file must not import Skia.

function getXAxisLabelSpace(xAxisLabelHeight = 0): number {
    return VictoryTheme.axis.xAxisLabelGap + Math.max(xAxisLabelHeight, X_AXIS_LABEL_MIN_HEIGHT);
}

function getCartesianChartHeight(xAxisLabelHeight = 0): number {
    return CHART_CONTENT_MIN_HEIGHT + getXAxisLabelSpace(xAxisLabelHeight);
}

function getBarChartLoadingHeight(shouldShowLabels = true): number {
    return shouldShowLabels ? getCartesianChartHeight() : CHART_CONTENT_MIN_HEIGHT;
}

function getPieChartLoadingHeight(styles: ThemeStyles, shouldShowLegend = true): number {
    const legendFirstRowHeight = shouldShowLegend ? styles.pieChartLegendContainer.marginTop + variables.fontSizeNormalHeight : 0;
    return CHART_CONTENT_MIN_HEIGHT + legendFirstRowHeight;
}

export {getXAxisLabelSpace, getCartesianChartHeight, getBarChartLoadingHeight, getPieChartLoadingHeight};
