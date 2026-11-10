import BAR_INNER_PADDING from '@components/Charts/barChartConstants';
import type {YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

import type {ChartBounds, PointsArray} from 'victory-native';

import parseOffset from './parseOffset';
import scalePixels from './scalePixels';

const DEFAULT_BETWEEN_GROUP_PADDING = 0.25;

type BarGroupLayoutConfig = {
    yKeys: YKey[];
    index: number;
    barWidth?: number;
    offsetAttribute?: string;
};

type BarSeriesLayoutConfig = {
    barWidth?: number;
    group?: BarGroupLayoutConfig;
};

type BarInteractionGeometry = {
    x: number;
    y: number;
    width: number;
};

function getUngroupedBarWidth(chartBounds: ChartBounds, pointCount: number, customBarWidth?: number): number {
    if (customBarWidth) {
        return customBarWidth;
    }

    if (pointCount <= 0) {
        return 0;
    }

    const domainWidth = chartBounds.right - chartBounds.left;
    const denominator = pointCount - 1 <= 0 ? pointCount : pointCount - 1;
    return ((1 - BAR_INNER_PADDING) * domainWidth) / denominator;
}

function getGroupedBarGeometry(chartBounds: ChartBounds, pointCount: number, group: BarGroupLayoutConfig, pixelScale: number): Pick<BarInteractionGeometry, 'width'> & {centerOffset: number} {
    const groupCount = group.yKeys.length;
    const boundSize = chartBounds.right - chartBounds.left;
    const barWidth = scalePixels(group.barWidth, pixelScale);
    const betweenGroupPadding = barWidth ? parseOffset(group.offsetAttribute ?? '', chartBounds, groupCount, barWidth, pointCount, false, pixelScale) : DEFAULT_BETWEEN_GROUP_PADDING;
    const groupWidth = ((1 - betweenGroupPadding) * boundSize) / Math.max(1, pointCount);
    const width = barWidth ?? ((1 - BAR_INNER_PADDING) * groupWidth) / Math.max(1, groupCount);
    const gapWidth = (groupWidth - width * groupCount) / Math.max(1, groupCount - 1);
    const centerOffset = -groupWidth / 2 + group.index * (width + gapWidth) + width / 2;

    return {width, centerOffset};
}

/**
 * Returns where a bar is drawn, for hit testing. `barWidth` and the group offset in `seriesConfig` are the raw
 * chart attributes, so `pixelScale` must be the factor the chart is rendered at, as it is for the bars themselves.
 */
function getVictoryBarInteractionGeometry(
    point: PointsArray[number],
    chartBounds: ChartBounds,
    pointCount: number,
    seriesConfig?: BarSeriesLayoutConfig,
    pixelScale = 1,
): BarInteractionGeometry | undefined {
    if (typeof point.y !== 'number') {
        return;
    }

    if (seriesConfig?.group) {
        const groupedGeometry = getGroupedBarGeometry(chartBounds, pointCount, seriesConfig.group, pixelScale);
        return {
            x: point.x + groupedGeometry.centerOffset,
            y: point.y,
            width: groupedGeometry.width,
        };
    }

    return {
        x: point.x,
        y: point.y,
        width: getUngroupedBarWidth(chartBounds, pointCount, scalePixels(seriesConfig?.barWidth, pixelScale)),
    };
}

function isCursorInVerticalBar(cursorX: number, cursorY: number, targetX: number, targetY: number, width: number, yZero: number): boolean {
    'worklet';

    if (width <= 0) {
        return false;
    }

    const barLeft = targetX - width / 2;
    const barRight = targetX + width / 2;
    const barTop = Math.min(targetY, yZero);
    const barBottom = Math.max(targetY, yZero);

    return cursorX >= barLeft && cursorX <= barRight && cursorY >= barTop && cursorY <= barBottom;
}

export {getVictoryBarInteractionGeometry, isCursorInVerticalBar};
export type {BarSeriesLayoutConfig};
