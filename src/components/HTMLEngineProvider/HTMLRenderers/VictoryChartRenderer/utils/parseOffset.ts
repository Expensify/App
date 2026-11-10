import type {ChartBounds} from 'victory-native';

import {parseAttributeAsNumber} from './parseAttribute';

/**
 * Translate VictoryChart's `offset` attribute into victory-native's `betweenGroupPadding` percentage.
 */
function parseOffset(attribute: string, chartBounds: ChartBounds, groupCount: number, barWidth: number, pointsCount: number, isHorizontal: boolean, pixelScale = 1): number {
    // The offset attribute is a pixel gap between bars, so it scales with the chart's pixel scale.
    const offset = (parseAttributeAsNumber(attribute) ?? 0) * pixelScale;
    const boundSize = isHorizontal ? chartBounds.top - chartBounds.bottom : chartBounds.right - chartBounds.left;
    const groupWidth = barWidth + offset * (groupCount - 1);
    const betweenGroupPadding = 1 - groupWidth * (pointsCount / boundSize);
    return betweenGroupPadding;
}

export default parseOffset;
