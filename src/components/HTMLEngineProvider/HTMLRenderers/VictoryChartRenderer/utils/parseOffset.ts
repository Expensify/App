import type {ChartBounds} from 'victory-native';
import parseAttribute from './parseAttribute';

/**
 * Translate VictoryChart's `offset` attribute into victory-native's `betweenGroupPadding` percentage.
 */
function parseOffset(attribute: string, chartBounds: ChartBounds, groupCount: number, barWidth: number, pointsCount: number, isHorizontal: boolean): number {
    const offset = attribute ? Number(parseAttribute(attribute)) : 0;
    const boundSize = isHorizontal ? chartBounds.top - chartBounds.bottom : chartBounds.right - chartBounds.left;
    const groupWidth = barWidth + offset * (groupCount - 1);
    const betweenGroupPadding = 1 - groupWidth * (pointsCount / boundSize);
    return betweenGroupPadding;
}

export default parseOffset;
