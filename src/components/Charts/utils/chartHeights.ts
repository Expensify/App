import VictoryTheme, {CHART_CONTENT_MIN_HEIGHT, X_AXIS_LABEL_MIN_HEIGHT} from '@components/Charts/VictoryTheme';

import type {ThemeStyles} from '@styles/index';
import variables from '@styles/variables';

// Imported before the chart engine has loaded, so this file must not import Skia.

function getXAxisLabelSpace(xAxisLabelHeight = 0, labelGap: number = VictoryTheme.axis.xAxisLabelGap): number {
    return labelGap + Math.max(xAxisLabelHeight, X_AXIS_LABEL_MIN_HEIGHT);
}

function getCartesianChartHeight(xAxisLabelHeight = 0): number {
    return CHART_CONTENT_MIN_HEIGHT + getXAxisLabelSpace(xAxisLabelHeight);
}

function getHorizontalBarChartMinHeight(valueLabelHeight = 0): number {
    return CHART_CONTENT_MIN_HEIGHT + getXAxisLabelSpace(valueLabelHeight, VictoryTheme.axis.labelGap);
}

/** A vertical chart whose labels only fit as horizontal bars is predicted at the vertical height, so its height can change once revealed. */
function getBarChartLoadingHeight(isHorizontal: boolean): number {
    return isHorizontal ? getHorizontalBarChartMinHeight() : getCartesianChartHeight();
}

function getPieChartLoadingHeight(styles: ThemeStyles, shouldShowLegend = true): number {
    const legendFirstRowHeight = shouldShowLegend ? styles.pieChartLegendContainer.marginTop + variables.fontSizeNormalHeight : 0;
    return CHART_CONTENT_MIN_HEIGHT + legendFirstRowHeight;
}

export {getXAxisLabelSpace, getCartesianChartHeight, getHorizontalBarChartMinHeight, getBarChartLoadingHeight, getPieChartLoadingHeight};
